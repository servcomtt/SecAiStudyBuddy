'use strict';

/**
 * tests/server.test.js
 * Integration tests for the Study Buddy LMS API (server.js)
 *
 * Uses an in-memory SQLite database (DB_PATH=:memory: is not supported by
 * better-sqlite3, so we use a temp file that is deleted after the suite).
 *
 * Run with: node --test
 * Or a single file: node --test tests/server.test.js
 */

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const fs     = require('node:fs');
const path   = require('node:path');
const os     = require('node:os');

// ── Spin up the app against a throwaway DB ────────────────────────────────────

const TEST_DB = path.join(os.tmpdir(), `sb_test_${Date.now()}.db`);

process.env.DB_PATH      = TEST_DB;
process.env.JWT_SECRET   = 'test-jwt-secret-for-testing-only';
process.env.PORT         = '0';          // OS assigns a free port
process.env.CORS_ORIGIN  = '*';
process.env.LMS_API_KEY  = 'test-lms-api-key';
process.env.WEBHOOK_SECRET = 'test-webhook-secret';
// Don't try to reach external importer service during tests
delete process.env.IMPORTER_URL;

let server;
let baseUrl;
let adminToken;
let studentToken;
let adminUserId;
let studentUserId;
let courseId;
let moduleId;
const ADMIN_PASSWORD = 'RootSafe91!#';
const STUDENT_PASSWORD = 'LearnerPass91!#';

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function req(method, urlPath, { body, token, contentType } = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = body !== undefined ? JSON.stringify(body) : undefined;
    const opts = {
      method,
      hostname: '127.0.0.1',
      port    : new URL(baseUrl).port,
      path    : urlPath,
      headers : {
        ...(contentType ? { 'Content-Type': contentType } : { 'Content-Type': 'application/json' }),
        ...(token       ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(bodyStr     ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

// ── Setup / teardown ─────────────────────────────────────────────────────────

before(async () => {
  // Start server
  const app = require('../server.js');
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;

  // Register admin user
  const adminReg = await req('POST', '/api/auth/register', {
    body: { email: 'admin@test.local', password: ADMIN_PASSWORD, display_name: 'Test Admin' }
  });
  assert.equal(adminReg.status, 201, `admin registration failed: ${JSON.stringify(adminReg.body)}`);
  adminToken  = adminReg.body.token;
  adminUserId = adminReg.body.user?.id;

  // Promote to admin directly in the DB
  const Database = require('better-sqlite3');
  const db = new Database(TEST_DB);
  db.prepare("UPDATE users SET role = 'admin' WHERE email = 'admin@test.local'").run();
  db.close();

  // Re-login to get a token with admin role
  const adminLogin = await req('POST', '/api/auth/login', {
    body: { email: 'admin@test.local', password: ADMIN_PASSWORD }
  });
  assert.equal(adminLogin.status, 200, `admin login failed: ${JSON.stringify(adminLogin.body)}`);
  adminToken = adminLogin.body.token;

  // Register student user
  const stuReg = await req('POST', '/api/auth/register', {
    body: { email: 'student@test.local', password: STUDENT_PASSWORD, display_name: 'Test Student' }
  });
  assert.equal(stuReg.status, 201, `student registration failed: ${JSON.stringify(stuReg.body)}`);
  studentToken  = stuReg.body.token;
  studentUserId = stuReg.body.user?.id;

  // Create a course directly via DB for tests that need course+module data
  const db2 = new Database(TEST_DB);
  const cid = require('crypto').randomUUID();
  const mid = require('crypto').randomUUID();
  courseId  = cid;
  moduleId  = mid;
  db2.prepare(
    `INSERT INTO courses (id, slug, exam_code, title, vendor, chapter_count, passing_score, is_active)
     VALUES (?, 'da0-001', 'CY0-001', 'CompTIA SecAI+', 'CompTIA', 8, 70, 1)`
  ).run(cid);
  db2.prepare(
    `INSERT INTO modules (id, course_id, slug, title, sort_order, is_active)
     VALUES (?, ?, 'ch1', 'Chapter 1', 1, 1)`
  ).run(mid, cid);
  db2.prepare(
    `INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, is_active)
     VALUES (?, ?, ?, datetime('now'), 1)`
  ).run(require('crypto').randomUUID(), studentUserId, cid);
  db2.prepare(
    `INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, is_active)
     VALUES (?, ?, ?, datetime('now'), 1)`
  ).run(require('crypto').randomUUID(), adminUserId, cid);
  db2.close();
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  try { fs.unlinkSync(TEST_DB); } catch { /* already gone */ }
  // Also delete WAL/SHM files
  try { fs.unlinkSync(TEST_DB + '-wal'); } catch { /* ok */ }
  try { fs.unlinkSync(TEST_DB + '-shm'); } catch { /* ok */ }
});


// ── Health ────────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const r = await req('GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
  });
});


// ── Auth ──────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('rejects missing email', async () => {
    const r = await req('POST', '/api/auth/register', { body: { password: 'abc12345' } });
    assert.equal(r.status, 400);
  });

  test('rejects short password', async () => {
    const r = await req('POST', '/api/auth/register', {
      body: { email: 'short@test.local', password: 'abc' }
    });
    assert.equal(r.status, 400);
  });

  test('rejects duplicate email', async () => {
    const r = await req('POST', '/api/auth/register', {
      body: { email: 'admin@test.local', password: ADMIN_PASSWORD }
    });
    assert.equal(r.status, 409);
  });

  test('registers a new user and returns token', async () => {
    const r = await req('POST', '/api/auth/register', {
      body: { email: 'new@test.local', password: 'NewUserPass123!', display_name: 'New' }
    });
    assert.equal(r.status, 201);
    assert.ok(r.body.token, 'should return a JWT token');
    assert.equal(r.body.user.email, 'new@test.local');
  });
});

describe('POST /api/auth/login', () => {
  test('rejects wrong password', async () => {
    const r = await req('POST', '/api/auth/login', {
      body: { email: 'admin@test.local', password: 'wrongpassword' }
    });
    assert.equal(r.status, 401);
  });

  test('rejects unknown email', async () => {
    const r = await req('POST', '/api/auth/login', {
      body: { email: 'nobody@test.local', password: ADMIN_PASSWORD }
    });
    assert.equal(r.status, 401);
  });

  test('returns token on successful login', async () => {
    const r = await req('POST', '/api/auth/login', {
      body: { email: 'student@test.local', password: STUDENT_PASSWORD }
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.token);
  });
});

describe('GET /api/auth/me', () => {
  test('returns 401 without token', async () => {
    const r = await req('GET', '/api/auth/me');
    assert.equal(r.status, 401);
  });

  test('returns current user with valid token', async () => {
    const r = await req('GET', '/api/auth/me', { token: studentToken });
    assert.equal(r.status, 200);
    assert.equal(r.body.email, 'student@test.local');
  });
});


// ── Courses ───────────────────────────────────────────────────────────────────

describe('GET /api/courses', () => {
  test('returns 401 without token', async () => {
    const r = await req('GET', '/api/courses');
    assert.equal(r.status, 401);
  });

  test('returns enrolled courses for student', async () => {
    const r = await req('GET', '/api/courses', { token: studentToken });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length >= 1, 'student should see their enrolled course');
    assert.equal(r.body[0].slug, 'da0-001');
  });
});

describe('GET /api/admin/courses', () => {
  test('returns 403 for non-admin', async () => {
    const r = await req('GET', '/api/admin/courses', { token: studentToken });
    assert.equal(r.status, 403);
  });

  test('returns all courses for admin as {courses:[]}', async () => {
    const r = await req('GET', '/api/admin/courses', { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.courses), 'body.courses should be an array');
    assert.ok(r.body.courses.length >= 1);
  });
});

describe('GET /api/admin/courses/:id/modules', () => {
  test('returns modules for a course', async () => {
    const r = await req('GET', `/api/admin/courses/${courseId}/modules`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.modules));
    assert.equal(r.body.modules[0].slug, 'ch1');
  });
});


// ── Progress ─────────────────────────────────────────────────────────────────

describe('GET /api/progress/:courseSlug', () => {
  test('returns 401 without auth', async () => {
    const r = await req('GET', '/api/progress/da0-001');
    assert.equal(r.status, 401);
  });

  test('returns progress object for enrolled student', async () => {
    const r = await req('GET', '/api/progress/da0-001', { token: studentToken });
    assert.equal(r.status, 200);
    assert.ok('progress' in r.body || Array.isArray(r.body) || typeof r.body === 'object',
      'should return some progress structure');
  });
});


// ── Admin — Users ─────────────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  test('returns 403 for non-admin', async () => {
    const r = await req('GET', '/api/admin/users', { token: studentToken });
    assert.equal(r.status, 403);
  });

  test('returns paginated user list for admin', async () => {
    const r = await req('GET', '/api/admin/users', { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body), 'body should be an array');
    assert.ok(r.body.some(user => user.email === 'student@test.local'));
  });

  test('pagination limit/offset params accepted', async () => {
    const r = await req('GET', '/api/admin/users?limit=1&offset=0', { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.length <= 1);
  });
});


// ── Question Bank ─────────────────────────────────────────────────────────────

describe('POST /api/admin/question-bank — create question manually', () => {
  let createdQuestionId;

  test('rejects missing required fields', async () => {
    const r = await req('POST', '/api/admin/question-bank', {
      token: adminToken,
      body : { course_id: courseId }  // missing question_text, option_json, answer_json
    });
    assert.equal(r.status, 400);
  });

  test('creates a question and returns it', async () => {
    const r = await req('POST', '/api/admin/question-bank', {
      token: adminToken,
      body : {
        course_id   : courseId,
        question_text : 'What does SQL stand for?',
        option_json : JSON.stringify([
          { key: 'A', text: 'Standard Query Language' },
          { key: 'B', text: 'Structured Query Language' },
          { key: 'C', text: 'Simple Query Language' },
          { key: 'D', text: 'Sequential Query Language' },
        ]),
        answer_json     : JSON.stringify(['B']),
        explanation_text: 'SQL = Structured Query Language.',
        difficulty      : 'easy',
        question_type   : 'single',
      }
    });
    assert.equal(r.status, 201);
    assert.ok(r.body.question.id, 'should return question with id');
    assert.equal(r.body.question.question_text, 'What does SQL stand for?');
    assert.equal(r.body.question.status, 'published');
    createdQuestionId = r.body.question.id;
  });

  test('GET /api/admin/question-bank returns the created question', async () => {
    const r = await req('GET', `/api/admin/question-bank?course_id=${courseId}`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.questions.some(q => q.question_text === 'What does SQL stand for?'));
    assert.ok(typeof r.body.total === 'number');
  });

  test('GET /api/admin/question-bank filters by difficulty', async () => {
    const r = await req('GET', `/api/admin/question-bank?course_id=${courseId}&difficulty=easy`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.questions.every(q => q.difficulty === 'easy'));
  });

  test('PATCH /api/admin/question-bank/:id edits the question', async () => {
    if (!createdQuestionId) return;
    const r = await req('PATCH', `/api/admin/question-bank/${createdQuestionId}`, {
      token: adminToken,
      body : { difficulty: 'medium', domain: 'Data Concepts' }
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.question.difficulty, 'medium');
    assert.equal(r.body.question.domain, 'Data Concepts');
  });

  test('PATCH increments version', async () => {
    if (!createdQuestionId) return;
    const before = await req('GET', `/api/admin/question-bank?course_id=${courseId}`, { token: adminToken });
    const q = before.body.questions.find(x => x.id === createdQuestionId);
    const vBefore = q?.version || 1;

    await req('PATCH', `/api/admin/question-bank/${createdQuestionId}`, {
      token: adminToken,
      body : { domain: 'Updated Domain' }
    });

    const after = await req('GET', `/api/admin/question-bank?course_id=${courseId}`, { token: adminToken });
    const qAfter = after.body.questions.find(x => x.id === createdQuestionId);
    assert.ok(qAfter.version > vBefore, 'version should increment on edit');
  });

  test('GET /api/admin/question-bank/:id/revisions returns history', async () => {
    if (!createdQuestionId) return;
    const r = await req('GET', `/api/admin/question-bank/${createdQuestionId}/revisions`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.revisions));
    assert.ok(r.body.revisions.length >= 1, 'should have at least a create revision');
  });

  test('DELETE /api/admin/question-bank/:id archives the question', async () => {
    if (!createdQuestionId) return;
    const r = await req('DELETE', `/api/admin/question-bank/${createdQuestionId}`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);

    // Confirm status changed to archived
    const check = await req('GET', `/api/admin/question-bank?course_id=${courseId}&status=archived`, {
      token: adminToken
    });
    assert.ok(check.body.questions.some(q => q.id === createdQuestionId));
  });

  test('non-admin gets 403 on question bank endpoints', async () => {
    const r = await req('GET', '/api/admin/question-bank', { token: studentToken });
    assert.equal(r.status, 403);
  });
});


// ── Question Import Jobs ──────────────────────────────────────────────────────

describe('POST /api/admin/question-imports/:id/results — importer callback', () => {
  let jobId;

  test('setup: create import job via DB', async () => {
    const Database = require('better-sqlite3');
    const db = new Database(TEST_DB);
    jobId = require('crypto').randomUUID();
    db.prepare(
      `INSERT INTO question_import_jobs
         (id, instructor_user_id, course_id, source_filename, source_type, status, parsing_mode, created_at)
       VALUES (?, ?, ?, 'test.pdf', 'pdf', 'processing', 'auto', datetime('now'))`
    ).run(jobId, adminUserId, courseId);
    db.close();
    assert.ok(jobId);
  });

  test('rejects callback with wrong API key', async () => {
    const r = await req('POST', `/api/admin/question-imports/${jobId}/results`, {
      token: 'wrong-key',
      body : { status: 'review', items: [] }
    });
    assert.equal(r.status, 401);
  });

  test('rejects callback with missing API key header', async () => {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify({ status: 'review', items: [] });
      const r = http.request({
        method  : 'POST',
        hostname: '127.0.0.1',
        port    : new URL(baseUrl).port,
        path    : `/api/admin/question-imports/${jobId}/results`,
        headers : {
          'Content-Type'  : 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      }, res => {
        res.resume();
        res.on('end', () => {
          try { assert.equal(res.statusCode, 401); resolve(); } catch (e) { reject(e); }
        });
      });
      r.on('error', reject);
      r.write(bodyStr);
      r.end();
    });
  });

  test('accepts valid callback and stores items', async () => {
    const r = await req('POST', `/api/admin/question-imports/${jobId}/results`, {
      token: process.env.LMS_API_KEY,
      body : {
        status       : 'review',
        ocr_used     : false,
        total_detected: 2,
        items        : [
          {
            detected_question_number: 1,
            question_text           : 'What is ETL?',
            option_json             : JSON.stringify([
              { key: 'A', text: 'Extract Test Load' },
              { key: 'B', text: 'Extract Transform Load' },
            ]),
            correct_answer_json     : JSON.stringify(['B']),
            explanation_text        : 'ETL = Extract, Transform, Load.',
            question_type           : 'single',
            confidence_score        : 0.85,
            review_status           : 'pending',
          },
          {
            detected_question_number: 2,
            question_text           : 'What does OLAP stand for?',
            option_json             : JSON.stringify([
              { key: 'A', text: 'Online Analytical Processing' },
              { key: 'B', text: 'Online Activity Processing' },
            ]),
            correct_answer_json     : JSON.stringify(['A']),
            question_type           : 'single',
            confidence_score        : 0.90,
            review_status           : 'pending',
          },
        ],
        image_assets : [],
      }
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);
    assert.equal(r.body.items_stored, 2);
  });

  test('GET /api/admin/question-imports/:id returns updated job', async () => {
    const r = await req('GET', `/api/admin/question-imports/${jobId}`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.equal(r.body.job.status, 'review');
    assert.equal(r.body.job.total_detected, 2);
  });

  test('GET /api/admin/question-imports/:id/items lists extracted questions', async () => {
    const r = await req('GET', `/api/admin/question-imports/${jobId}/items`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.equal(r.body.items.length, 2);
    assert.ok(Array.isArray(r.body.items[0].option_json), 'option_json should be parsed array');
    assert.ok(Array.isArray(r.body.items[0].correct_answer_json));
  });

  test('PATCH item edits question text', async () => {
    const listR = await req('GET', `/api/admin/question-imports/${jobId}/items`, { token: adminToken });
    const itemId = listR.body.items[0].id;

    const r = await req('PATCH', `/api/admin/question-imports/${jobId}/items/${itemId}`, {
      token: adminToken,
      body : { question_text: 'What is the ETL process?', difficulty: 'medium' }
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.item.question_text, 'What is the ETL process?');
    assert.equal(r.body.item.difficulty, 'medium');
  });

  test('POST /approve marks item as approved', async () => {
    const listR = await req('GET', `/api/admin/question-imports/${jobId}/items`, { token: adminToken });
    const itemId = listR.body.items[0].id;

    const r = await req('POST', `/api/admin/question-imports/${jobId}/items/${itemId}/approve`, {
      token: adminToken
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);

    // Verify status changed
    const check = await req('GET', `/api/admin/question-imports/${jobId}/items?review_status=approved`, {
      token: adminToken
    });
    assert.ok(check.body.items.some(i => i.id === itemId));
  });

  test('POST /publish publishes approved items to question_bank', async () => {
    // Approve second item first
    const listR = await req('GET', `/api/admin/question-imports/${jobId}/items`, { token: adminToken });
    const item2 = listR.body.items.find(i => i.review_status !== 'approved');
    if (item2) {
      await req('POST', `/api/admin/question-imports/${jobId}/items/${item2.id}/approve`, {
        token: adminToken
      });
    }

    const r = await req('POST', `/api/admin/question-imports/${jobId}/publish`, { token: adminToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);
    assert.ok(r.body.published >= 1, 'at least one item should be published');

    // Verify question_bank has the new questions
    const bank = await req('GET', `/api/admin/question-bank?course_id=${courseId}`, { token: adminToken });
    assert.ok(bank.body.questions.some(q => q.question_text === 'What is the ETL process?'));
  });

  test('POST /publish is idempotent — re-publishing skips already-published items', async () => {
    const r = await req('POST', `/api/admin/question-imports/${jobId}/publish`, { token: adminToken });
    assert.equal(r.status, 200);
    // Should not double-insert — count should stay the same
    const bank1 = await req('GET', `/api/admin/question-bank?course_id=${courseId}&status=published`, {
      token: adminToken
    });
    const countAfterFirstPublish = bank1.body.total;

    const r2 = await req('POST', `/api/admin/question-imports/${jobId}/publish`, { token: adminToken });
    const bank2 = await req('GET', `/api/admin/question-bank?course_id=${courseId}&status=published`, {
      token: adminToken
    });
    assert.equal(bank2.body.total, countAfterFirstPublish, 'idempotent: no duplicate rows on re-publish');
  });
});


// ── Question Bank — export JS ─────────────────────────────────────────────────

describe('POST /api/admin/question-bank/export-js', () => {
  test('returns 400 without course_id', async () => {
    const r = await req('POST', '/api/admin/question-bank/export-js', {
      token: adminToken,
      body : {}
    });
    assert.equal(r.status, 400);
  });

  test('returns a JS file as text/javascript', async () => {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify({ course_id: courseId });
      const opts = {
        method  : 'POST',
        hostname: '127.0.0.1',
        port    : new URL(baseUrl).port,
        path    : '/api/admin/question-bank/export-js',
        headers : {
          'Content-Type'  : 'application/json',
          'Authorization' : `Bearer ${adminToken}`,
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      };
      const r = http.request(opts, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            assert.equal(res.statusCode, 200);
            assert.ok(res.headers['content-type']?.includes('javascript'));
            assert.ok(data.includes('QUIZ_BANK'), 'JS export should define QUIZ_BANK');
            resolve();
          } catch (e) { reject(e); }
        });
      });
      r.on('error', reject);
      r.write(bodyStr);
      r.end();
    });
  });
});


// ── Admin reports ─────────────────────────────────────────────────────────────

describe('Admin report endpoints', () => {
  test('GET /api/admin/reports/completion returns data for admin', async () => {
    const r = await req('GET', '/api/admin/reports/completion', { token: adminToken });
    assert.equal(r.status, 200);
  });

  test('GET /api/admin/reports/labs returns data for admin', async () => {
    const r = await req('GET', '/api/admin/reports/labs', { token: adminToken });
    assert.equal(r.status, 200);
  });

  test('GET /api/admin/reports/activity returns data for admin', async () => {
    const r = await req('GET', '/api/admin/reports/activity', { token: adminToken });
    assert.equal(r.status, 200);
  });

  test('all report endpoints return 403 for students', async () => {
    const endpoints = [
      '/api/admin/reports/completion',
      '/api/admin/reports/labs',
      '/api/admin/reports/activity',
    ];
    for (const ep of endpoints) {
      const r = await req('GET', ep, { token: studentToken });
      assert.equal(r.status, 403, `${ep} should return 403 for student`);
    }
  });
});


describe('POST /api/labs/orchestrator/provision', () => {
  test('requires authentication', async () => {
    const r = await req('POST', '/api/labs/orchestrator/provision', {
      body: { activity_id: 'ch1-lab-code', lab_type: 'python' }
    });
    assert.equal(r.status, 401);
  });
});


// ── Webhook ───────────────────────────────────────────────────────────────────

describe('POST /api/labs/webhook/complete', () => {
  test('rejects requests without webhook secret header', async () => {
    const r = await req('POST', '/api/labs/webhook/complete', {
      body: { attempt_id: 'fake', user_id: 'fake', score: 80, passed: true }
    });
    assert.equal(r.status, 401);
  });

  test('rejects wrong webhook secret', async () => {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify({ attempt_id: 'fake', user_id: 'fake', score: 80, passed: true });
      const r = http.request({
        method  : 'POST',
        hostname: '127.0.0.1',
        port    : new URL(baseUrl).port,
        path    : '/api/labs/webhook/complete',
        headers : {
          'Content-Type'    : 'application/json',
          'X-Webhook-Secret': 'wrong-secret',
          'Content-Length'  : Buffer.byteLength(bodyStr),
        },
      }, res => {
        res.resume();
        res.on('end', () => {
          try { assert.equal(res.statusCode, 401); resolve(); } catch(e) { reject(e); }
        });
      });
      r.on('error', reject);
      r.write(bodyStr);
      r.end();
    });
  });
});


// ── Auth settings ──────────────────────────────────────────────────────────────

describe('PATCH /api/auth/settings', () => {
  test('updates settings_json', async () => {
    const r = await req('PATCH', '/api/auth/settings', {
      token: studentToken,
      body : { settings: { theme: 'dark', fontSize: 18 } }
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);

    const me = await req('GET', '/api/auth/me', { token: studentToken });
    assert.equal(me.status, 200);
    assert.equal(me.body.settings_json.theme, 'dark');
    assert.equal(me.body.settings_json.fontSize, 18);
  });
});

describe('PATCH /api/auth/password', () => {
  test('rejects wrong current password', async () => {
    const r = await req('PATCH', '/api/auth/password', {
      token: studentToken,
      body : { current_password: 'wrongpass', new_password: 'OrbitFresh456!' }
    });
    assert.equal(r.status, 401);
  });

  test('changes password with correct current password', async () => {
    const r = await req('PATCH', '/api/auth/password', {
      token: studentToken,
      body : { current_password: STUDENT_PASSWORD, new_password: 'StudentNew456!!' }
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.ok);

    // Verify new password works
    const login = await req('POST', '/api/auth/login', {
      body: { email: 'student@test.local', password: 'StudentNew456!!' }
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.token);
  });
});
