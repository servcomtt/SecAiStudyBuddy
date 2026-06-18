'use strict';

/**
 * question-importer/tests/importer-server.test.js
 * Unit + integration tests for the question-importer microservice.
 *
 * Run with: node --test  (from question-importer/ directory)
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const fs     = require('node:fs');
const path   = require('node:path');
const os     = require('node:os');

// ── Environment setup ─────────────────────────────────────────────────────────

const UPLOAD_DIR  = path.join(os.tmpdir(), `qi_uploads_${Date.now()}`);
const RESULTS_DIR = path.join(os.tmpdir(), `qi_results_${Date.now()}`);

process.env.IMPORTER_PORT = '0';
process.env.LMS_URL       = 'http://127.0.0.1:19999';   // intentionally unreachable — tests don't send callbacks
process.env.LMS_API_KEY   = 'test-lms-api-key';
process.env.UPLOAD_DIR    = UPLOAD_DIR;
process.env.RESULTS_DIR   = RESULTS_DIR;
process.env.MAX_FILE_MB   = '10';

fs.mkdirSync(UPLOAD_DIR,  { recursive: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ── App ───────────────────────────────────────────────────────────────────────

let server;
let baseUrl;

before(async () => {
  const app = require('../server.js');
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(UPLOAD_DIR,  { recursive: true, force: true });
  fs.rmSync(RESULTS_DIR, { recursive: true, force: true });
});

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function get(urlPath) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    http.get(`http://127.0.0.1:${port}${urlPath}`, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

// Multipart POST helper (builds a minimal multipart/form-data body manually)
async function postMultipart(urlPath, fields, fileField, fileBuffer, filename, mimeType) {
  return new Promise((resolve, reject) => {
    const boundary = `----TestBoundary${Date.now()}`;
    const CRLF = '\r\n';

    let parts = [];
    // Text fields
    for (const [name, value] of Object.entries(fields)) {
      parts.push(
        `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
        `${value}${CRLF}`
      );
    }
    // File field
    const filePart =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="${fileField}"; filename="${filename}"${CRLF}` +
      `Content-Type: ${mimeType}${CRLF}${CRLF}`;
    const closing = `${CRLF}--${boundary}--${CRLF}`;

    const textBuf    = Buffer.from(parts.join(''), 'utf8');
    const fileHdrBuf = Buffer.from(filePart, 'utf8');
    const closingBuf = Buffer.from(closing, 'utf8');
    const body       = Buffer.concat([textBuf, fileHdrBuf, fileBuffer, closingBuf]);

    const { port } = server.address();
    const opts = {
      method  : 'POST',
      hostname: '127.0.0.1',
      port,
      path    : urlPath,
      headers : {
        'Content-Type'  : `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200 with service name', async () => {
    const r = await get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
    assert.equal(r.body.service, 'question-importer');
  });
});


describe('POST /parse — validation', () => {
  test('rejects request with no file', async () => {
    return new Promise((resolve, reject) => {
      const bodyStr = 'job_id=test-id';
      const { port } = server.address();
      const r = http.request({
        method  : 'POST',
        hostname: '127.0.0.1',
        port,
        path    : '/parse',
        headers : {
          'Content-Type'  : 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      }, res => {
        res.resume();
        res.on('end', () => {
          try { assert.equal(res.statusCode, 400); resolve(); } catch(e) { reject(e); }
        });
      });
      r.on('error', reject);
      r.write(bodyStr);
      r.end();
    });
  });

  test('rejects unsupported file type', async () => {
    const fakeCsv = Buffer.from('a,b,c\n1,2,3\n');
    const r = await postMultipart(
      '/parse',
      { job_id: 'test-job-123' },
      'file', fakeCsv, 'data.csv', 'text/csv'
    );
    assert.equal(r.status, 400);
  });

  test('rejects missing job_id even with valid file', async () => {
    const fakePdf = Buffer.from('%PDF-1.4\n%%EOF');
    const r = await postMultipart(
      '/parse',
      {},   // no job_id
      'file', fakePdf, 'test.pdf', 'application/pdf'
    );
    assert.equal(r.status, 400);
    assert.ok(r.body.error?.includes('job_id'));
  });
});


describe('POST /parse — accepts and queues valid uploads', () => {
  test('accepts a PDF upload and returns accepted status', async () => {
    // A minimal valid PDF structure (just enough for multer to accept it)
    const fakePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n');
    const r = await postMultipart(
      '/parse',
      { job_id: 'test-pdf-job-001', parsing_mode: 'auto' },
      'file', fakePdf, 'test_questions.pdf', 'application/pdf'
    );
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'accepted');
    assert.equal(r.body.job_id, 'test-pdf-job-001');
  });

  test('accepts a DOCX upload and returns accepted status', async () => {
    // Minimal DOCX is a ZIP with specific structure — use a minimal stub
    // (Won't parse successfully but multer should accept it)
    const fakeDocx = Buffer.from('PK\x03\x04');  // ZIP magic bytes
    const r = await postMultipart(
      '/parse',
      { job_id: 'test-docx-job-001', parsing_mode: 'multiple_choice' },
      'file', fakeDocx, 'test_questions.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'accepted');
  });

  test('accepts a PNG image upload', async () => {
    // Minimal 1x1 PNG
    const pngHeader = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
      '2e00000000c4944415408d763f8cfc00000000200019e19700000000049454e44ae426082',
      'hex'
    );
    const r = await postMultipart(
      '/parse',
      { job_id: 'test-img-job-001' },
      'file', pngHeader, 'scan.png', 'image/png'
    );
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'accepted');
  });

  test('rejects files exceeding MAX_FILE_MB limit', async () => {
    // 11 MB of zeros — exceeds our 10 MB limit
    const bigFile = Buffer.alloc(11 * 1024 * 1024, 0);
    const r = await postMultipart(
      '/parse',
      { job_id: 'oversize-job' },
      'file', bigFile, 'big.pdf', 'application/pdf'
    );
    assert.equal(r.status, 413);
  });
});


describe('Question-detector integration via parse pipeline', () => {
  test('detectQuestions correctly processes a text fixture', async () => {
    // Direct test of the detector (not the HTTP endpoint, which is async)
    const { detectQuestions } = require('../parsers/question-detector.js');

    const text = `
1. What is a data lake?
A. A structured data warehouse
B. A raw storage repository for all data types
C. A type of relational database
D. A visualisation tool
Answer: B
Explanation: A data lake stores data in its raw, unprocessed form.

2. What does ACID stand for?
A. Atomicity, Consistency, Isolation, Durability
B. Access, Control, Integration, Data
C. Automated, Consistent, Indexed, Durable
D. Atomicity, Consistency, Indexed, Durable
Answer: A
    `.trim();

    const { questions, stats } = detectQuestions(text);
    assert.equal(stats.total, 2);
    assert.equal(stats.withAnswers, 2);
    assert.equal(questions[0].correctAnswers[0], 'B');
    assert.equal(questions[1].correctAnswers[0], 'A');
    assert.ok(questions[0].explanation?.includes('raw'));
    assert.equal(stats.withExplanations, 1);
    assert.ok(stats.avgConfidence > 0.7);
  });
});
