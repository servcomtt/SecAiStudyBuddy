'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

let Database = null;
try {
  Database = require('better-sqlite3');
} catch {
  Database = null;
}

const WEB_BASE_URL = (process.env.PERF_WEB_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'studybuddy.db');
const STRICT = process.env.PERF_STRICT === '1';

const TARGETS = {
  pageTotalMs: parseInt(process.env.PERF_TARGET_PAGE_MS || '2500', 10),
  apiTotalMs: parseInt(process.env.PERF_TARGET_API_MS || '3000', 10),
  aiFirstByteMs: parseInt(process.env.PERF_TARGET_AI_START_MS || '800', 10),
  dbQueryMs: parseInt(process.env.PERF_TARGET_DB_MS || '150', 10),
};

const PAGE_PATHS = ['/dashboard', '/domains', '/chapters/ch2/topics', '/ai'];

function roundMs(value) {
  return Math.round(value * 10) / 10;
}

function parseServerTiming(headerValue) {
  if (!headerValue) return [];
  return headerValue
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [namePart, ...rest] = chunk.split(';').map((piece) => piece.trim());
      const metric = { name: namePart, dur: null };
      for (const part of rest) {
        if (part.startsWith('dur=')) {
          const value = Number(part.slice(4));
          metric.dur = Number.isFinite(value) ? value : null;
        }
      }
      return metric;
    });
}

function requestTiming(url, options = {}) {
  const target = new URL(url);
  const transport = target.protocol === 'https:' ? https : http;
  const method = options.method || 'GET';
  const body = options.body || null;
  const headers = options.headers || {};

  return new Promise((resolve, reject) => {
    const startedAt = performance.now();
    const req = transport.request(
      target,
      {
        method,
        headers,
      },
      (res) => {
        const ttfbMs = roundMs(performance.now() - startedAt);
        let firstByteMs = null;
        let bytes = 0;
        const chunks = [];

        res.on('data', (chunk) => {
          if (firstByteMs === null) {
            firstByteMs = roundMs(performance.now() - startedAt);
          }
          bytes += chunk.length;
          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve({
            url,
            status: res.statusCode || 0,
            ttfbMs,
            firstByteMs: firstByteMs ?? ttfbMs,
            totalMs: roundMs(performance.now() - startedAt),
            bytes,
            body: Buffer.concat(chunks).toString('utf8'),
            headers: res.headers,
            serverTiming: parseServerTiming(res.headers['server-timing']),
          });
        });
      },
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function statusLabel(value, target) {
  return value <= target ? 'PASS' : 'WARN';
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

async function measurePages() {
  printSection('Page Load Speed');
  const results = [];

  for (const routePath of PAGE_PATHS) {
    const result = await requestTiming(`${WEB_BASE_URL}${routePath}`);
    results.push(result);
    const label = statusLabel(result.totalMs, TARGETS.pageTotalMs);
    console.log(
      `${label} ${routePath} total=${result.totalMs}ms ttfb=${result.ttfbMs}ms bytes=${result.bytes}`,
    );
  }

  return results;
}

async function measureApi() {
  printSection('API Response Time');
  const result = await requestTiming(`${WEB_BASE_URL}/api/chat`);
  const label = statusLabel(result.totalMs, TARGETS.apiTotalMs);
  const timingBits = result.serverTiming
    .map((entry) => `${entry.name}${entry.dur === null ? '' : `=${roundMs(entry.dur)}ms`}`)
    .join(', ');

  console.log(
    `${label} /api/chat status=${result.status} total=${result.totalMs}ms ttfb=${result.ttfbMs}ms${timingBits ? ` server-timing=[${timingBits}]` : ''}`,
  );

  return result;
}

async function measureAiStart() {
  printSection('AI Response Start Time');
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'Explain mean vs median briefly.' }],
    stream: true,
  });
  const result = await requestTiming(`${WEB_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    body: payload,
  });
  const label = statusLabel(result.firstByteMs, TARGETS.aiFirstByteMs);
  const hasMetaEvent = result.body.includes('event: meta');
  console.log(
    `${label} first-byte=${result.firstByteMs}ms total=${result.totalMs}ms status=${result.status} meta=${hasMetaEvent ? 'yes' : 'no'}`,
  );

  return result;
}

function runQuerySamples(statement, iterations = 7) {
  const samples = [];
  statement.raw(true);
  for (let i = 0; i < iterations; i += 1) {
    const startedAt = performance.now();
    statement.all();
    samples.push(roundMs(performance.now() - startedAt));
  }
  return samples.slice(1);
}

function summarizeSamples(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const total = samples.reduce((sum, value) => sum + value, 0);
  return {
    avg: roundMs(total / samples.length),
    p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))],
  };
}

function measureDbQueries() {
  printSection('DB Query Timing');

  if (!Database || !fs.existsSync(DB_PATH)) {
    console.log(`SKIP database not available at ${DB_PATH}`);
    return [];
  }

  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  const queries = [
    {
      label: 'question-bank-count',
      sql: 'SELECT COUNT(*) AS total FROM question_bank',
    },
    {
      label: 'module-list',
      sql: 'SELECT id, slug, title FROM modules WHERE is_active = 1 ORDER BY sort_order LIMIT 25',
    },
    {
      label: 'course-module-join',
      sql: `
        SELECT c.slug, m.slug, m.title
        FROM courses c
        JOIN modules m ON m.course_id = c.id
        WHERE c.is_active = 1 AND m.is_active = 1
        ORDER BY c.slug, m.sort_order
        LIMIT 50
      `,
    },
  ];

  const results = queries.map((entry) => {
    const statement = db.prepare(entry.sql);
    const summary = summarizeSamples(runQuerySamples(statement));
    const label = statusLabel(summary.p95, TARGETS.dbQueryMs);
    console.log(`${label} ${entry.label} avg=${summary.avg}ms p95=${summary.p95}ms`);
    return { ...entry, ...summary };
  });

  db.close();
  return results;
}

function summarizeFailures(pageResults, apiResult, aiResult, dbResults) {
  const failures = [];

  for (const page of pageResults) {
    if (page.totalMs > TARGETS.pageTotalMs) {
      failures.push(`${page.url} exceeded page target (${page.totalMs}ms > ${TARGETS.pageTotalMs}ms)`);
    }
  }

  if (apiResult.totalMs > TARGETS.apiTotalMs) {
    failures.push(`/api/chat exceeded API target (${apiResult.totalMs}ms > ${TARGETS.apiTotalMs}ms)`);
  }

  if (aiResult.firstByteMs > TARGETS.aiFirstByteMs) {
    failures.push(`AI start exceeded target (${aiResult.firstByteMs}ms > ${TARGETS.aiFirstByteMs}ms)`);
  }

  for (const dbResult of dbResults) {
    if (dbResult.p95 > TARGETS.dbQueryMs) {
      failures.push(`${dbResult.label} exceeded DB target (${dbResult.p95}ms > ${TARGETS.dbQueryMs}ms)`);
    }
  }

  return failures;
}

async function main() {
  console.log(`Using web base URL: ${WEB_BASE_URL}`);
  console.log(
    `Targets: pages<=${TARGETS.pageTotalMs}ms api<=${TARGETS.apiTotalMs}ms ai-first-byte<=${TARGETS.aiFirstByteMs}ms db<=${TARGETS.dbQueryMs}ms`,
  );

  const pageResults = await measurePages();
  const apiResult = await measureApi();
  const aiResult = await measureAiStart();
  const dbResults = measureDbQueries();
  const failures = summarizeFailures(pageResults, apiResult, aiResult, dbResults);

  printSection('Summary');
  if (failures.length === 0) {
    console.log('PASS all phase-one performance targets met in this run.');
    return;
  }

  for (const failure of failures) {
    console.log(`WARN ${failure}`);
  }

  if (STRICT) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('FAIL performance smoke test could not complete.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
