/**
 * Study Buddy — API Server
 * Node.js + Express
 *
 * Database: SQLite via better-sqlite3 (default, zero-config).
 *           Set DATABASE_URL=postgres://... to switch to PostgreSQL (pg).
 *
 * Auth:     JWT (HS256). Tokens issued on login, verified on every
 *           protected route. Pass in Authorization: Bearer <token>.
 *
 * Usage:
 *   npm install
 *   node server.js           # starts on PORT (default 3001)
 *
 * Environment variables (all optional):
 *   PORT           HTTP port (default 3001)
 *   DATABASE_URL   postgres://user:pass@host/db  (omit = SQLite)
 *   DB_PATH        Path to SQLite file (default ./db/studybuddy.db)
 *   JWT_SECRET     Signing secret (default: insecure dev value — CHANGE IN PROD)
 *   CORS_ORIGIN    Allowed origin (default http://localhost:3000)
 *   CERT_PREFIX    Certificate number prefix (default SB)
 */

'use strict';

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path       = require('path');
const fs         = require('fs');
const multer     = require('multer');
const { Readable } = require('stream');

// ── OWASP Security Middleware ────────────────────────────────────────────────
const {
  RateLimiter, securityHeaders, inputSanitizer, bodySizeLimit,
  validatePassword, validateEmail, securityLog, AccountLockout,
  csrfHeaderCheck, assertProductionSecrets,
} = require('./middleware/security');

// ── Database abstraction ──────────────────────────────────────────────────────

let db;
const IS_PG = !!process.env.DATABASE_URL;

// PostgreSQL uses $1,$2,... placeholders; SQLite uses ?.
// normalizeSql() converts ? → $N when targeting PostgreSQL.
function normalizeSql(sql) {
  if (!IS_PG) return sql;
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

if (IS_PG) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Thin wrapper: run(sql, params) for mutations, all(sql, params) for queries
  db = {
    run: (sql, params = []) => pool.query(normalizeSql(sql), params),
    all: async (sql, params = []) => { const r = await pool.query(normalizeSql(sql), params); return r.rows; },
    get: async (sql, params = []) => { const r = await pool.query(normalizeSql(sql), params); return r.rows[0]; },
    exec: (sql) => pool.query(sql)
  };
} else {
  const Database = require('better-sqlite3');
  const dbPath   = process.env.DB_PATH || path.join(__dirname, 'db', 'studybuddy.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite   = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  // Wrap synchronous better-sqlite3 in async-compatible API
  db = {
    run: (sql, params = []) => Promise.resolve(sqlite.prepare(sql).run(...params)),
    all: (sql, params = []) => Promise.resolve(sqlite.prepare(sql).all(...params)),
    get: (sql, params = []) => Promise.resolve(sqlite.prepare(sql).get(...params)),
    exec: (sql) => { sqlite.exec(sql); return Promise.resolve(); }
  };

  // Bootstrap schema if db is empty
  const schemaPath = path.join(__dirname, 'db', 'schema.sqlite.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    sqlite.exec(schemaSQL);
  }
  // Bootstrap question bank schema
  const qbankSchemaPath = path.join(__dirname, 'db', 'schema.qbank.sqlite.sql');
  if (fs.existsSync(qbankSchemaPath)) {
    const qbankSQL = fs.readFileSync(qbankSchemaPath, 'utf8');
    sqlite.exec(qbankSQL);
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

const PORT           = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET     = process.env.JWT_SECRET     || 'dev-secret-CHANGE-IN-PRODUCTION';
const CORS_ORIGIN    = process.env.CORS_ORIGIN    || 'http://localhost:3000';
const CERT_PREFIX    = process.env.CERT_PREFIX    || 'SB';
const WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET  || 'dev-webhook-secret-CHANGE-ME';
const IMPORTER_URL    = (process.env.IMPORTER_URL   || 'http://localhost:3003').replace(/\/$/, '');
const LMS_API_KEY     = process.env.LMS_API_KEY     || '';
const LAB_ORCHESTRATOR_URL = (process.env.LAB_ORCHESTRATOR_URL || process.env.LAB_ORCH_URL || 'http://localhost:3002').replace(/\/$/, '');
const ORCHESTRATOR_API_KEY = process.env.ORCHESTRATOR_API_KEY || WEBHOOK_SECRET;
const QIMPORT_DIR     = process.env.QIMPORT_DIR     || path.join(__dirname, 'uploads', 'question-imports');
const CONTENT_DIR = path.join(__dirname, 'content');
const STUDY_SPA_DIR = path.join(CONTENT_DIR, 'study-spa');
const NOTEBOOKS_DIR = path.join(CONTENT_DIR, 'notebooks');
/** Ollama HTTP API (server-side only). Browser uses same-origin /sb-ollama/* when study-spa is served from this LMS. */
const OLLAMA_INTERNAL_BASE = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');

/** Node fetch errors are often TypeError("fetch failed") with the real reason on err.cause (e.g. ECONNREFUSED). */
function ollamaProxyFailure(err) {
  const cause = err && err.cause;
  const code = cause && cause.code;
  const detail = [err && err.message, cause && cause.message].filter(Boolean).join(' — ');
  let hint =
    `The LMS could not open a TCP connection to ${OLLAMA_INTERNAL_BASE}. Start Ollama locally (it should listen on port 11434), or set OLLAMA_BASE_URL in .env to the correct base URL.`;
  if (code === 'ECONNREFUSED') {
    hint += ` (${code}: nothing listening — is \`ollama serve\` running, or are you in Docker? Try OLLAMA_BASE_URL=http://host.docker.internal:11434 on Windows/Mac.)`;
  } else if (code === 'ENOTFOUND') {
    hint += ` (${code}: check the hostname in OLLAMA_BASE_URL.)`;
  } else if (code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT') {
    hint += ` (${code}: firewall or Ollama not reachable on that host.)`;
  }
  return { detail: detail || String(err), code: code || null, hint };
}

// Multer storage for question-import file uploads
const _qimportStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(QIMPORT_DIR, { recursive: true });
    cb(null, QIMPORT_DIR);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  },
});
const _qimportUpload = multer({
  storage: _qimportStorage,
  limits : { fileSize: 50 * 1024 * 1024 },  // 50 MB
  fileFilter: (_req, file, cb) => {
    const ok = /\.(pdf|docx|doc|png|jpg|jpeg|tiff|bmp)$/i.test(file.originalname);
    cb(ok ? null : new Error('Unsupported file type.'), ok);
  },
});

if (JWT_SECRET     === 'dev-secret-CHANGE-IN-PRODUCTION')  console.warn('[WARN] Using default JWT_SECRET. Set JWT_SECRET env var before production use.');
if (WEBHOOK_SECRET === 'dev-webhook-secret-CHANGE-ME')     console.warn('[WARN] Using default WEBHOOK_SECRET. Set WEBHOOK_SECRET env var before production use.');
if (!LMS_API_KEY)                                          console.warn('[WARN] LMS_API_KEY is unset. Importer callbacks are disabled until configured.');

assertProductionSecrets([
  ['JWT_SECRET', JWT_SECRET, ['dev-secret-CHANGE-IN-PRODUCTION']],
  ['WEBHOOK_SECRET', WEBHOOK_SECRET, ['dev-webhook-secret-CHANGE-ME', 'dev-webhook-secret']],
  ['LMS_API_KEY', LMS_API_KEY, ['', 'dev-lms-api-key-CHANGE-ME']],
  ['ORCHESTRATOR_API_KEY', ORCHESTRATOR_API_KEY, ['dev-webhook-secret-CHANGE-ME', 'dev-webhook-secret']],
]);

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();

// ── OWASP A05: Security Misconfiguration — disable fingerprinting ────────────
app.disable('x-powered-by');
app.set('trust proxy', 1);  // trust first proxy for rate-limit IP

// Request correlation (supports inbound X-Request-ID from gateways / Next.js)
app.use((req, res, next) => {
  const fromHeader = req.headers['x-request-id'];
  const id =
    typeof fromHeader === 'string' && /^[\w-]{8,128}$/.test(fromHeader.trim())
      ? fromHeader.trim()
      : uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
});

// ── OWASP A05/A02: Security Headers ─────────────────────────────────────────
app.use(securityHeaders());

// ── OWASP A04: Rate Limiting — general API ──────────────────────────────────
const globalLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 100, message: 'Too many requests. Please slow down.' });
app.use('/api/', globalLimiter.middleware());

// ── OWASP A07: Strict rate limit on auth endpoints ──────────────────────────
const authLimiter = new RateLimiter({ windowMs: 900000, maxRequests: 15, message: 'Too many auth attempts. Try again in 15 minutes.' });
app.use('/api/auth/login', authLimiter.middleware());
app.use('/api/auth/register', authLimiter.middleware());

// ── Rate limit Ollama proxy (prevents unauthenticated abuse when exposed) ───
const ollamaLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 30, message: 'Too many AI requests. Please slow down.' });
app.use('/sb-ollama/', ollamaLimiter.middleware());

// ── OWASP A07: Account lockout tracker ──────────────────────────────────────
const accountLockout = new AccountLockout({ maxAttempts: 5, lockoutMinutes: 15 });

// ── OWASP A01: CORS — strict origin ────────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  maxAge: 600,  // cache preflight for 10 min
}));

// ── OWASP A08: CSRF protection header check ─────────────────────────────────
app.use('/api/', csrfHeaderCheck());

// ── OWASP A04: Body size limit (1 MB) ──────────────────────────────────────
app.use(bodySizeLimit(1 * 1024 * 1024));
app.use(express.json({ limit: '1mb' }));

// ── OWASP A03: Input sanitization ───────────────────────────────────────────
app.use(inputSanitizer());

// ── Ollama proxy (same-origin for study-spa — avoids browser CORS: localhost:PORT → 127.0.0.1:11434)
app.get('/sb-ollama/api/tags', async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_INTERNAL_BASE}/api/tags`, {
      signal: AbortSignal.timeout(10_000),
    });
    res.status(response.status);
    const ct = response.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    const { detail, code, hint } = ollamaProxyFailure(err);
    securityLog('OLLAMA_PROXY', {
      path: '/sb-ollama/api/tags',
      target: OLLAMA_INTERNAL_BASE,
      err: detail,
      code,
    });
    res.status(502).json({
      error: 'Unable to reach Ollama',
      hint,
    });
  }
});

app.post('/sb-ollama/api/chat', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_INTERNAL_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.status(response.status);
    const ct = response.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    const { detail, code, hint } = ollamaProxyFailure(err);
    securityLog('OLLAMA_PROXY', {
      path: '/sb-ollama/api/chat',
      target: OLLAMA_INTERNAL_BASE,
      err: detail,
      code,
    });
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Unable to reach Ollama',
        hint,
      });
    } else {
      res.destroy();
    }
  }
});

// Serve static files for the study SPA and notebook downloads
app.use('/notebooks', express.static(NOTEBOOKS_DIR, {
  dotfiles: 'deny',
  index: false,
}));
app.use(express.static(STUDY_SPA_DIR, {
  dotfiles: 'deny',         // Block .env, .git, etc.
  index: 'index.html',
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function now() { return new Date().toISOString(); }
function uuid() { return uuidv4(); }

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: '4h',              // OWASP A07: shorter token lifetime
      issuer:    'studybuddy-api',   // OWASP A02: validate issuer on verify
      audience:  'studybuddy-app',   // OWASP A02: validate audience on verify
    }
  );
}

// JSON column helper (SQLite stores JSON as TEXT)
function parseJson(val, fallback = null) {
  if (val == null) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function jsonCol(val) {
  if (val == null) return null;            // preserve SQL NULL — don't stringify to "null"
  return IS_PG ? val : JSON.stringify(val);
}

// Certificate number: SB-DA0001-2026-00042
let _certSeq = 0;
async function nextCertNumber(courseSlug) {
  const year = new Date().getFullYear();
  const count = await db.get(
    'SELECT COUNT(*) AS n FROM completion_certificates WHERE course_id IN (SELECT id FROM courses WHERE slug = ?)',
    [courseSlug]
  );
  _certSeq = (count ? Number(count.n || count.count) : 0) + 1;
  const slug = courseSlug.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
  return `${CERT_PREFIX}-${slug}-${year}-${String(_certSeq).padStart(5, '0')}`;
}

// ── Auth middleware ───────────────────────────────────────────────────────────

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET, {
      algorithms: ['HS256'],          // OWASP A02: reject 'none' and RS* alg-switching
      issuer:     'studybuddy-api',   // OWASP A02: validate issuer
      audience:   'studybuddy-app',   // OWASP A02: validate audience
    });
    next();
  } catch (err) {
    securityLog('AUTH_FAILURE', { path: req.path, reason: err.message, ip: req.ip });
    res.status(401).json({ error: 'Token expired or invalid.' });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin role required.' });
    }
    next();
  });
}

// ── Async handler wrapper ─────────────────────────────────────────────────────
// Catches async errors and forwards them to the Express error handler below.
// NOTE: The actual error-handler middleware is registered AFTER all routes.

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}


// =============================================================================
// AUTH ROUTES
// =============================================================================

/** POST /api/auth/register */
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required.' });

  // OWASP A03: Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // OWASP A07: Enforce strong password policy
  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return res.status(400).json({ error: pwCheck.errors.join(' ') });
  }

  // OWASP A03: Sanitize display name length
  const safeName = display_name ? String(display_name).slice(0, 100) : null;

  const exists = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (exists) {
    // OWASP A07: Don't reveal whether email exists — use generic message
    securityLog('REGISTER_DUPLICATE', { email: email.toLowerCase(), ip: req.ip });
    return res.status(409).json({ error: 'Registration failed. Please try a different email.' });
  }

  // OWASP A02: Use higher bcrypt cost factor
  const hash = await bcrypt.hash(password, 12);
  const id   = uuid();
  await db.run(
    'INSERT INTO users (id, email, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [id, email.toLowerCase(), safeName, hash, 'student']
  );
  const user  = await db.get('SELECT id, email, display_name, role FROM users WHERE id = ?', [id]);
  securityLog('USER_REGISTERED', { userId: id, email: email.toLowerCase(), ip: req.ip });
  res.status(201).json({ token: issueToken(user), user });
}));


/** POST /api/auth/login */
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required.' });

  const emailLower = email.toLowerCase();

  // OWASP A07: Check account lockout BEFORE querying DB
  if (accountLockout.isLocked(emailLower)) {
    securityLog('LOGIN_LOCKED', { email: emailLower, ip: req.ip });
    return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' });
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [emailLower]);

  // OWASP A07: Timing-safe — always hash-compare even if user not found
  const dummyHash = '$2a$12$LJ3m4ys3Lg7E0xEOEDr5g.0000000000000000000000000000000';
  const hashToCompare = user ? user.password_hash : dummyHash;
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !valid) {
    accountLockout.recordFailure(emailLower);
    securityLog('LOGIN_FAILED', { email: emailLower, ip: req.ip });
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  if (!user.is_active && user.is_active !== 1) {
    securityLog('LOGIN_DISABLED_ACCOUNT', { email: emailLower, ip: req.ip });
    return res.status(403).json({ error: 'Account disabled.' });
  }

  // Success — clear lockout counter
  accountLockout.reset(emailLower);

  await db.run('UPDATE users SET last_seen_at = ? WHERE id = ?', [now(), user.id]);
  securityLog('LOGIN_SUCCESS', { userId: user.id, email: emailLower, ip: req.ip });
  res.json({
    token: issueToken(user),
    user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role }
  });
}));


/** GET /api/auth/me */
app.get('/api/auth/me', authRequired, asyncHandler(async (req, res) => {
  const user = await db.get(
    'SELECT id, email, display_name, role, avatar_url, settings_json, created_at, last_seen_at FROM users WHERE id = ?',
    [req.user.sub]
  );
  if (!user) return res.status(404).json({ error: 'User not found.' });
  user.settings_json = parseJson(user.settings_json, {});
  res.json(user);
}));


/** PATCH /api/auth/settings — save accessibility settings */
app.patch('/api/auth/settings', authRequired, asyncHandler(async (req, res) => {
  const settings = req.body.settings || {};
  await db.run(
    'UPDATE users SET settings_json = ?, updated_at = ? WHERE id = ?',
    [jsonCol(settings), now(), req.user.sub]
  );
  res.json({ ok: true });
}));


/** PATCH /api/auth/password */
app.patch('/api/auth/password', authRequired, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required.' });

  // OWASP A07: Enforce strong password policy on change
  const pwCheck = validatePassword(new_password);
  if (!pwCheck.valid) {
    return res.status(400).json({ error: pwCheck.errors.join(' ') });
  }

  const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.sub]);
  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) {
    securityLog('PASSWORD_CHANGE_FAILED', { userId: req.user.sub, ip: req.ip });
    return res.status(401).json({ error: 'Current password incorrect.' });
  }

  // OWASP A02: Use higher bcrypt cost factor
  const hash = await bcrypt.hash(new_password, 12);
  await db.run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [hash, now(), req.user.sub]);
  securityLog('PASSWORD_CHANGED', { userId: req.user.sub, ip: req.ip });
  res.json({ ok: true });
}));


// =============================================================================
// COURSE ROUTES
// =============================================================================

/** GET /api/courses — list active courses the user is enrolled in */
app.get('/api/courses', authRequired, asyncHandler(async (req, res) => {
  const courses = await db.all(
    `SELECT c.id, c.slug, c.exam_code, c.title, c.description, c.vendor,
            c.version, c.chapter_count, c.passing_score, e.enrolled_at, e.expires_at
     FROM courses c
     JOIN course_enrollments e ON e.course_id = c.id AND e.user_id = ? AND e.is_active = 1
     WHERE c.is_active = 1
     ORDER BY c.title`,
    [req.user.sub]
  );
  res.json(courses);
}));

/** GET /api/admin/courses — list ALL courses (admin only, for dropdowns) */
app.get('/api/admin/courses', adminRequired, asyncHandler(async (req, res) => {
  const courses = await db.all(
    `SELECT id, slug, exam_code, title, vendor, chapter_count FROM courses WHERE is_active = 1 ORDER BY title`,
    []
  );
  res.json({ courses });
}));

/** GET /api/admin/courses/:courseId/modules — list modules for a course (admin only) */
app.get('/api/admin/courses/:courseId/modules', adminRequired, asyncHandler(async (req, res) => {
  const modules = await db.all(
    `SELECT id, slug, title, sort_order FROM modules WHERE course_id = ? AND is_active = 1 ORDER BY sort_order`,
    [req.params.courseId]
  );
  res.json({ modules });
}));


/** GET /api/courses/:slug — course detail + modules */
app.get('/api/courses/:slug', authRequired, asyncHandler(async (req, res) => {
  const course = await db.get(
    `SELECT c.* FROM courses c
     JOIN course_enrollments e ON e.course_id = c.id AND e.user_id = ? AND e.is_active = 1
     WHERE c.slug = ? AND c.is_active = 1`,
    [req.user.sub, req.params.slug]
  );
  if (!course) return res.status(404).json({ error: 'Course not found or not enrolled.' });

  const modules = await db.all(
    `SELECT id, slug, title, sort_order, topic_count, flashcard_count, quiz_question_count
     FROM modules WHERE course_id = ? AND is_active = 1 ORDER BY sort_order`,
    [course.id]
  );
  res.json({ ...course, modules });
}));


// =============================================================================
// PROGRESS ROUTES
// =============================================================================

/** GET /api/progress/:courseSlug — all module progress for current user + course */
app.get('/api/progress/:courseSlug', authRequired, asyncHandler(async (req, res) => {
  const course = await db.get('SELECT id FROM courses WHERE slug = ?', [req.params.courseSlug]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  const rows = await db.all(
    `SELECT mp.*, m.slug AS module_slug
     FROM module_progress mp
     JOIN modules m ON m.id = mp.module_id
     WHERE mp.user_id = ? AND mp.course_id = ?`,
    [req.user.sub, course.id]
  );

  // Convert to { ch1: {...}, ch2: {...} } map matching client state shape
  const result = {};
  rows.forEach(r => {
    result[r.module_slug] = {
      progress_pct:    r.progress_pct,
      active_tab:      r.active_tab,
      topics_seen:     parseJson(r.topics_seen, []),
      topic_current:   r.topic_current,
      flashcard_index: r.flashcard_index,
      quiz_index:      r.quiz_index,
      quiz_score:      r.quiz_score,
      quiz_correct:    r.quiz_correct,
      quiz_attempted:  r.quiz_attempted,
      notes_text:      r.notes_text,
      is_complete:     !!r.is_complete,
      completed_at:    r.completed_at,
      last_active_at:  r.last_active_at
    };
  });
  res.json(result);
}));


/** PUT /api/progress/:courseSlug/:moduleSlug — upsert module progress */
app.put('/api/progress/:courseSlug/:moduleSlug', authRequired, asyncHandler(async (req, res) => {
  const { courseSlug, moduleSlug } = req.params;

  const course = await db.get('SELECT id FROM courses WHERE slug = ?', [courseSlug]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  const module = await db.get(
    'SELECT id FROM modules WHERE course_id = ? AND slug = ?', [course.id, moduleSlug]
  );
  if (!module) return res.status(404).json({ error: 'Module not found.' });

  const p = req.body;
  const existing = await db.get(
    'SELECT id FROM module_progress WHERE user_id = ? AND module_id = ?',
    [req.user.sub, module.id]
  );

  const topicsSeen = jsonCol(Array.isArray(p.topics_seen) ? p.topics_seen : []);
  const ts = now();

  if (existing) {
    await db.run(
      `UPDATE module_progress SET
        active_tab = ?, topics_seen = ?, topic_current = ?,
        flashcard_index = ?, quiz_index = ?, quiz_score = ?,
        quiz_correct = ?, quiz_attempted = ?,
        progress_pct = ?, notes_text = ?,
        last_active_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        p.active_tab      ?? 0,
        topicsSeen,
        p.topic_current   ?? 0,
        p.flashcard_index ?? 0,
        p.quiz_index      ?? 0,
        p.quiz_score      ?? null,
        p.quiz_correct    ?? 0,
        p.quiz_attempted  ?? 0,
        p.progress_pct    ?? 0,
        p.notes_text      ?? null,
        ts, ts,
        existing.id
      ]
    );
  } else {
    await db.run(
      `INSERT INTO module_progress
        (id, user_id, module_id, course_id, active_tab, topics_seen, topic_current,
         flashcard_index, quiz_index, quiz_score, quiz_correct, quiz_attempted,
         progress_pct, notes_text, last_active_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(), req.user.sub, module.id, course.id,
        p.active_tab      ?? 0,
        topicsSeen,
        p.topic_current   ?? 0,
        p.flashcard_index ?? 0,
        p.quiz_index      ?? 0,
        p.quiz_score      ?? null,
        p.quiz_correct    ?? 0,
        p.quiz_attempted  ?? 0,
        p.progress_pct    ?? 0,
        p.notes_text      ?? null,
        ts, ts
      ]
    );
  }
  res.json({ ok: true });
}));


/** POST /api/progress/:courseSlug/:moduleSlug/complete — mark chapter complete */
app.post('/api/progress/:courseSlug/:moduleSlug/complete', authRequired, asyncHandler(async (req, res) => {
  const { courseSlug, moduleSlug } = req.params;
  const course = await db.get('SELECT id FROM courses WHERE slug = ?', [courseSlug]);
  const module = await db.get('SELECT id FROM modules WHERE course_id = ? AND slug = ?', [course?.id, moduleSlug]);
  if (!course || !module) return res.status(404).json({ error: 'Not found.' });

  const ts = now();
  await db.run(
    `INSERT INTO module_progress (id, user_id, module_id, course_id, progress_pct, is_complete, completed_at, last_active_at, updated_at)
     VALUES (?, ?, ?, ?, 100, 1, ?, ?, ?)
     ON CONFLICT (user_id, module_id) DO UPDATE SET
       progress_pct = 100, is_complete = 1, completed_at = ?, last_active_at = ?, updated_at = ?`,
    [uuid(), req.user.sub, module.id, course.id, ts, ts, ts, ts, ts, ts]
  );

  // Check if all modules complete → auto-issue certificate
  const allMods = await db.all('SELECT id FROM modules WHERE course_id = ? AND is_active = 1', [course.id]);
  const doneMods = await db.all(
    'SELECT id FROM module_progress WHERE user_id = ? AND course_id = ? AND is_complete = 1',
    [req.user.sub, course.id]
  );
  let certificate = null;
  if (doneMods.length >= allMods.length) {
    const existing = await db.get(
      'SELECT * FROM completion_certificates WHERE user_id = ? AND course_id = ? AND is_valid = 1',
      [req.user.sub, course.id]
    );
    if (!existing) {
      certificate = await issueCertificate(req.user.sub, course.id, courseSlug);
    } else {
      certificate = existing;
    }
  }
  res.json({ ok: true, certificate });
}));


// =============================================================================
// LAB ROUTES
// =============================================================================

/** GET /api/labs/:courseSlug/:moduleSlug — list labs for a module */
app.get('/api/labs/:courseSlug/:moduleSlug', authRequired, asyncHandler(async (req, res) => {
  const { courseSlug, moduleSlug } = req.params;
  const labs = await db.all(
    `SELECT l.id, l.activity_id, l.title, l.lab_type, l.instructions,
            l.max_score, l.passing_score, l.time_limit_s,
            (SELECT COUNT(*) FROM lab_attempts la
             WHERE la.lab_id = l.id AND la.user_id = ? AND la.status = 'submitted') AS attempts_submitted,
            (SELECT MAX(la.score) FROM lab_attempts la
             WHERE la.lab_id = l.id AND la.user_id = ? AND la.status = 'submitted') AS best_score
     FROM labs l
     JOIN modules m ON m.id = l.module_id
     JOIN courses c ON c.id = m.course_id
     WHERE c.slug = ? AND m.slug = ? AND l.is_active = 1
     ORDER BY l.sort_order`,
    [req.user.sub, req.user.sub, courseSlug, moduleSlug]
  );
  res.json(labs);
}));


/** POST /api/labs/attempts — start a new lab attempt */
app.post('/api/labs/attempts', authRequired, asyncHandler(async (req, res) => {
  const { activity_id } = req.body;
  if (!activity_id) return res.status(400).json({ error: 'activity_id required.' });

  const lab = await db.get('SELECT * FROM labs WHERE activity_id = ? AND is_active = 1', [activity_id]);
  if (!lab) return res.status(404).json({ error: 'Lab not found.' });

  // Check entitlement (skip for admins/instructors)
  if (req.user.role === 'student') {
    const ent = await db.get(
      `SELECT id, expires_at, max_attempts FROM user_lab_entitlements
       WHERE user_id = ? AND lab_id = ?`,
      [req.user.sub, lab.id]
    );
    if (!ent) return res.status(403).json({ error: 'Not entitled to this lab.' });
    if (ent.expires_at && new Date(ent.expires_at) < new Date())
      return res.status(403).json({ error: 'Lab entitlement expired.' });
    if (ent.max_attempts != null) {
      const used = await db.get(
        'SELECT COUNT(*) AS n FROM lab_attempts WHERE user_id = ? AND lab_id = ? AND status = ?',
        [req.user.sub, lab.id, 'submitted']
      );
      const n = Number(used?.n || used?.count || 0);
      if (n >= ent.max_attempts)
        return res.status(403).json({ error: `Maximum ${ent.max_attempts} attempt(s) reached.` });
    }
  }

  const prevAttempts = await db.get(
    'SELECT COUNT(*) AS n FROM lab_attempts WHERE user_id = ? AND lab_id = ?',
    [req.user.sub, lab.id]
  );
  const attemptNum = Number(prevAttempts?.n || prevAttempts?.count || 0) + 1;
  const id = uuid();

  await db.run(
    `INSERT INTO lab_attempts (id, user_id, lab_id, attempt_number, status, started_at, created_at)
     VALUES (?, ?, ?, ?, 'in_progress', ?, ?)`,
    [id, req.user.sub, lab.id, attemptNum, now(), now()]
  );
  res.status(201).json({ attempt_id: id, attempt_number: attemptNum, lab });
}));


/** PUT /api/labs/attempts/:id — submit or update an attempt */
app.put('/api/labs/attempts/:id', authRequired, asyncHandler(async (req, res) => {
  const attempt = await db.get(
    'SELECT * FROM lab_attempts WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.sub]
  );
  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
  if (attempt.status === 'submitted')
    return res.status(409).json({ error: 'Attempt already submitted.' });

  const { status, score, passed, time_spent_s, answer_json, feedback_json } = req.body;
  const ts = now();
  await db.run(
    `UPDATE lab_attempts SET
       status = ?, score = ?, passed = ?, time_spent_s = ?,
       answer_json = ?, feedback_json = ?,
       submitted_at = CASE WHEN ? = 'submitted' THEN ? ELSE submitted_at END
     WHERE id = ?`,
    [
      status || attempt.status,
      score  ?? attempt.score,
      passed ?? attempt.passed,
      time_spent_s ?? attempt.time_spent_s,
      jsonCol(answer_json || parseJson(attempt.answer_json, null)),
      jsonCol(feedback_json || parseJson(attempt.feedback_json, null)),
      status, ts,
      attempt.id
    ]
  );
  res.json({ ok: true });
}));


/** POST /api/labs/attempts/:id/events — append to event log */
app.post('/api/labs/attempts/:id/events', authRequired, asyncHandler(async (req, res) => {
  const attempt = await db.get(
    'SELECT id, lab_id FROM lab_attempts WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.sub]
  );
  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

  const events = Array.isArray(req.body) ? req.body : [req.body];
  for (const e of events) {
    await db.run(
      `INSERT INTO lab_event_log (attempt_id, user_id, lab_id, event_type, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [attempt.id, req.user.sub, attempt.lab_id, e.event_type, jsonCol(e.payload || null), e.ts || now()]
    );
  }
  res.json({ ok: true, inserted: events.length });
}));


/** GET /api/labs/attempts — current user's attempt history */
app.get('/api/labs/attempts', authRequired, asyncHandler(async (req, res) => {
  const { activity_id, limit = 20, offset = 0 } = req.query;
  const params = [req.user.sub];
  let where = 'la.user_id = ?';
  if (activity_id) { where += ' AND l.activity_id = ?'; params.push(activity_id); }
  params.push(Number(limit), Number(offset));

  const rows = await db.all(
    `SELECT la.id, la.attempt_number, la.status, la.score, la.passed,
            la.time_spent_s, la.started_at, la.submitted_at,
            l.activity_id, l.title AS lab_title, l.lab_type
     FROM lab_attempts la
     JOIN labs l ON l.id = la.lab_id
     WHERE ${where}
     ORDER BY la.created_at DESC
     LIMIT ? OFFSET ?`,
    params
  );
  res.json(rows);
}));


// =============================================================================
// LAB ORCHESTRATOR PROXY (authenticated — browser never needs direct :3002 access)
// =============================================================================

async function orchestratorRequest(method, orchPath, body) {
  const fetchFn = globalThis.fetch || require('node-fetch');
  const response = await fetchFn(`${LAB_ORCHESTRATOR_URL}${orchPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Orchestrator-Key': ORCHESTRATOR_API_KEY,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120_000),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || 'Invalid orchestrator response.' }; }
  return { status: response.status, data };
}

app.post('/api/labs/orchestrator/provision', authRequired, asyncHandler(async (req, res) => {
  const { activity_id, lab_type, attempt_id } = req.body;
  if (!activity_id) return res.status(400).json({ error: 'activity_id required.' });
  const result = await orchestratorRequest('POST', '/provision', {
    user_id: req.user.sub,
    activity_id,
    lab_type: lab_type || 'python',
    attempt_id: attempt_id || null,
  });
  res.status(result.status).json(result.data);
}));

app.post('/api/labs/orchestrator/exec/:sessionId', authRequired, asyncHandler(async (req, res) => {
  const result = await orchestratorRequest('POST', `/exec/${encodeURIComponent(req.params.sessionId)}`, req.body);
  res.status(result.status).json(result.data);
}));

app.post('/api/labs/orchestrator/reset/:sessionId', authRequired, asyncHandler(async (req, res) => {
  const result = await orchestratorRequest('POST', `/reset/${encodeURIComponent(req.params.sessionId)}`, req.body || {});
  res.status(result.status).json(result.data);
}));

app.delete('/api/labs/orchestrator/cleanup/:sessionId', authRequired, asyncHandler(async (req, res) => {
  const result = await orchestratorRequest('DELETE', `/cleanup/${encodeURIComponent(req.params.sessionId)}`);
  res.status(result.status).json(result.data);
}));

app.post('/api/labs/orchestrator/submit/:sessionId', authRequired, asyncHandler(async (req, res) => {
  const result = await orchestratorRequest('POST', `/submit/${encodeURIComponent(req.params.sessionId)}`, req.body);
  res.status(result.status).json(result.data);
}));


// =============================================================================
// QUIZ ATTEMPT ROUTES
// =============================================================================

/** POST /api/quiz/attempts — record a completed quiz attempt */
app.post('/api/quiz/attempts', authRequired, asyncHandler(async (req, res) => {
  const { course_slug, module_slug, quiz_type, mode, question_count,
          correct_count, score, topics_filter, answer_json } = req.body;

  const course = await db.get('SELECT id FROM courses WHERE slug = ?', [course_slug]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  let module_id = null;
  if (module_slug) {
    const mod = await db.get('SELECT id FROM modules WHERE course_id = ? AND slug = ?', [course.id, module_slug]);
    module_id = mod?.id || null;
  }

  const id = uuid();
  await db.run(
    `INSERT INTO quiz_attempts
      (id, user_id, course_id, module_id, quiz_type, mode, question_count,
       correct_count, score, topics_filter, answer_json, completed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, req.user.sub, course.id, module_id,
      quiz_type || 'chapter', mode || 'training',
      question_count || 0, correct_count || 0, score ?? null,
      jsonCol(topics_filter || null), jsonCol(answer_json || null),
      now(), now()
    ]
  );
  res.status(201).json({ attempt_id: id });
}));


// =============================================================================
// CERTIFICATE ROUTES
// =============================================================================

async function issueCertificate(userId, courseId, courseSlug) {
  const ts = now();
  const certNum = await nextCertNumber(courseSlug);

  // Calculate stats
  const progress = await db.all(
    'SELECT progress_pct, quiz_score FROM module_progress WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  );
  const totalMods = await db.get(
    'SELECT COUNT(*) AS n FROM modules WHERE course_id = ? AND is_active = 1', [courseId]
  );
  const avgScore = progress.length
    ? Math.round(progress.reduce((s, r) => s + (r.quiz_score || 0), 0) / progress.length)
    : 0;

  const id = uuid();
  await db.run(
    `INSERT INTO completion_certificates
      (id, user_id, course_id, certificate_number, overall_score,
       modules_completed, total_modules, issued_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, courseId, certNum, avgScore, progress.length, Number(totalMods?.n || totalMods?.count || 0), ts]
  );
  return { id, certificate_number: certNum, overall_score: avgScore, issued_at: ts };
}


/** GET /api/certificates — current user's certificates */
app.get('/api/certificates', authRequired, asyncHandler(async (req, res) => {
  const certs = await db.all(
    `SELECT cc.*, c.title AS course_title, c.slug AS course_slug, c.exam_code
     FROM completion_certificates cc
     JOIN courses c ON c.id = cc.course_id
     WHERE cc.user_id = ? AND cc.is_valid = 1
     ORDER BY cc.issued_at DESC`,
    [req.user.sub]
  );
  res.json(certs);
}));


/** GET /api/certificates/:certNumber — verify a certificate (public) */
app.get('/api/certificates/:certNumber', asyncHandler(async (req, res) => {
  const cert = await db.get(
    `SELECT cc.certificate_number, cc.overall_score, cc.modules_completed,
            cc.total_modules, cc.issued_at, cc.is_valid,
            u.display_name AS student_name,
            c.title AS course_title, c.exam_code
     FROM completion_certificates cc
     JOIN users u ON u.id = cc.user_id
     JOIN courses c ON c.id = cc.course_id
     WHERE cc.certificate_number = ?`,
    [req.params.certNumber]
  );
  if (!cert) return res.status(404).json({ error: 'Certificate not found.' });
  res.json(cert);
}));


// =============================================================================
// ADMIN / REPORTING ROUTES
// =============================================================================

/** GET /api/admin/users — paginated user list */
app.get('/api/admin/users', adminRequired, asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, search } = req.query;
  const params = [];
  let where = '1=1';
  if (search) { where += ' AND (u.email LIKE ? OR u.display_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  params.push(Number(limit), Number(offset));

  const users = await db.all(
    `SELECT u.id, u.email, u.display_name, u.role, u.is_active,
            u.created_at, u.last_seen_at,
            COUNT(e.id) AS enrolled_courses
     FROM users u
     LEFT JOIN course_enrollments e ON e.user_id = u.id AND e.is_active = 1
     WHERE ${where}
     GROUP BY u.id, u.email, u.display_name, u.role, u.is_active, u.created_at, u.last_seen_at
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    params
  );
  res.json(users);
}));


/** GET /api/admin/users/:userId/progress — one user's full progress */
app.get('/api/admin/users/:userId/progress', adminRequired, asyncHandler(async (req, res) => {
  const rows = await db.all(
    `SELECT mp.*, m.slug AS module_slug, m.title AS module_title, c.slug AS course_slug
     FROM module_progress mp
     JOIN modules m ON m.id = mp.module_id
     JOIN courses c ON c.id = mp.course_id
     WHERE mp.user_id = ?
     ORDER BY c.slug, m.sort_order`,
    [req.params.userId]
  );
  rows.forEach(r => { r.topics_seen = parseJson(r.topics_seen, []); });
  res.json(rows);
}));


/** GET /api/admin/reports/completion — completion rates per module */
app.get('/api/admin/reports/completion', adminRequired, asyncHandler(async (req, res) => {
  const { course_slug } = req.query;
  const params = course_slug ? [course_slug] : [];
  const courseFilter = course_slug ? 'AND c.slug = ?' : '';

  const rows = await db.all(
    `SELECT c.slug AS course_slug, m.slug AS module_slug, m.title,
            COUNT(DISTINCT e.user_id)                                              AS enrolled,
            COUNT(DISTINCT mp.user_id) FILTER (WHERE mp.is_complete = 1)          AS completed,
            ROUND(AVG(mp.progress_pct), 1)                                         AS avg_progress,
            ROUND(AVG(mp.quiz_score), 1)                                           AS avg_quiz_score
     FROM courses c
     JOIN modules m                  ON m.course_id = c.id AND m.is_active = 1
     JOIN course_enrollments e       ON e.course_id = c.id AND e.is_active = 1
     LEFT JOIN module_progress mp    ON mp.module_id = m.id AND mp.user_id = e.user_id
     WHERE c.is_active = 1 ${courseFilter}
     GROUP BY c.slug, m.id, m.slug, m.title
     ORDER BY c.slug, m.sort_order`,
    params
  );
  res.json(rows);
}));


/** GET /api/admin/reports/labs — lab performance */
app.get('/api/admin/reports/labs', adminRequired, asyncHandler(async (req, res) => {
  const rows = await db.all(
    `SELECT l.activity_id, l.title, l.lab_type,
            m.slug AS module_slug, c.slug AS course_slug,
            COUNT(la.id)                                                           AS total_attempts,
            COUNT(la.id) FILTER (WHERE la.status = 'submitted')                   AS submitted,
            COUNT(la.id) FILTER (WHERE la.passed = 1)                             AS passed,
            ROUND(100.0 * COUNT(la.id) FILTER (WHERE la.passed = 1)
                       / NULLIF(COUNT(la.id) FILTER (WHERE la.status='submitted'),0),1) AS pass_rate,
            ROUND(AVG(la.score) FILTER (WHERE la.status = 'submitted'), 1)         AS avg_score,
            ROUND(AVG(la.time_spent_s) FILTER (WHERE la.status = 'submitted'), 0)  AS avg_time_s,
            COUNT(DISTINCT la.user_id)                                             AS unique_users
     FROM labs l
     JOIN modules m    ON m.id = l.module_id
     JOIN courses c    ON c.id = m.course_id
     LEFT JOIN lab_attempts la ON la.lab_id = l.id
     GROUP BY l.id, l.activity_id, l.title, l.lab_type, m.slug, c.slug
     ORDER BY pass_rate ASC NULLS LAST`,
    []
  );
  res.json(rows);
}));


/** GET /api/admin/reports/activity — daily active users (last 30 days) */
app.get('/api/admin/reports/activity', adminRequired, asyncHandler(async (req, res) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await db.all(
    `SELECT substr(last_active_at, 1, 10) AS activity_date,
            course_id,
            COUNT(DISTINCT user_id)       AS dau
     FROM module_progress
     WHERE last_active_at >= ?
     GROUP BY substr(last_active_at, 1, 10), course_id
     ORDER BY activity_date DESC`,
    [cutoff]
  );
  res.json(rows);
}));


/** POST /api/admin/enroll — enroll a user in a course */
app.post('/api/admin/enroll', adminRequired, asyncHandler(async (req, res) => {
  const { user_id, course_slug, expires_at } = req.body;
  if (!user_id || !course_slug) return res.status(400).json({ error: 'user_id and course_slug required.' });

  const course = await db.get('SELECT id FROM courses WHERE slug = ?', [course_slug]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  await db.run(
    `INSERT INTO course_enrollments (id, user_id, course_id, enrolled_by, expires_at, is_active)
     VALUES (?, ?, ?, ?, ?, 1)
     ON CONFLICT (user_id, course_id) DO UPDATE SET is_active = 1, expires_at = ?, enrolled_by = ?`,
    [uuid(), user_id, course.id, req.user.sub, expires_at || null,
     expires_at || null, req.user.sub]
  );

  // Auto-grant all lab entitlements for this course
  const labs = await db.all(
    'SELECT l.id FROM labs l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? AND l.is_active = 1',
    [course.id]
  );
  for (const lab of labs) {
    await db.run(
      `INSERT INTO user_lab_entitlements (id, user_id, lab_id, granted_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, lab_id) DO NOTHING`,
      [uuid(), user_id, lab.id, req.user.sub]
    );
  }
  res.json({ ok: true, labs_granted: labs.length });
}));


// =============================================================================
// HEALTH + WEBHOOK ROUTES
// =============================================================================

/**
 * GET /health
 * Simple liveness probe used by Docker healthcheck and load balancers.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});


/**
 * POST /api/labs/webhook/complete
 * Called by the Lab Orchestrator when a student submits a lab exercise
 * inside a Docker container.  Verifies the shared WEBHOOK_SECRET header,
 * then records the final result in the lab_attempts table exactly as the
 * client-side PUT /api/labs/attempts/:id route does.
 *
 * Body (sent by orchestrator/server.js):
 *   attempt_id, user_id, activity_id,
 *   score, passed, time_spent_s, answer_json, feedback_json
 */
app.post('/api/labs/webhook/complete', asyncHandler(async (req, res) => {
  // ── Authenticate the orchestrator ─────────────────────────────────────────
  const incoming = req.headers['x-webhook-secret'];
  if (!incoming || incoming !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing webhook secret.' });
  }

  const {
    attempt_id, user_id, activity_id,
    score, passed, time_spent_s,
    answer_json, feedback_json
  } = req.body;

  if (!attempt_id) return res.status(400).json({ error: 'attempt_id is required.' });

  // ── Validate attempt belongs to the user ──────────────────────────────────
  const attempt = await db.get(
    'SELECT id, status FROM lab_attempts WHERE id = ? AND user_id = ?',
    [attempt_id, user_id]
  );
  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
  if (attempt.status === 'submitted')
    return res.status(409).json({ error: 'Attempt already submitted.' });

  // ── Persist result ────────────────────────────────────────────────────────
  const ts = now();
  await db.run(
    `UPDATE lab_attempts SET
       status       = 'submitted',
       score        = ?,
       passed       = ?,
       time_spent_s = ?,
       answer_json  = ?,
       feedback_json = ?,
       submitted_at = ?
     WHERE id = ?`,
    [
      score        ?? null,
      passed       ?? 0,
      time_spent_s ?? null,
      jsonCol(answer_json   || null),
      jsonCol(feedback_json || null),
      ts,
      attempt_id
    ]
  );

  // ── Log a completion event ────────────────────────────────────────────────
  const labRow = await db.get(
    'SELECT lab_id FROM lab_attempts WHERE id = ?', [attempt_id]
  );
  if (labRow) {
    await db.run(
      `INSERT INTO lab_event_log (attempt_id, user_id, lab_id, event_type, payload_json, created_at)
       VALUES (?, ?, ?, 'docker_submit', ?, ?)`,
      [attempt_id, user_id, labRow.lab_id,
       jsonCol({ activity_id, score, passed, time_spent_s }),
       ts]
    );
  }

  console.log(`[WEBHOOK] Lab submitted — attempt ${attempt_id} | score ${score} | passed ${passed}`);
  res.json({ ok: true, attempt_id });
}));


// =============================================================================
// QUESTION BANK — IMPORT JOBS
// =============================================================================

/**
 * POST /api/admin/question-imports
 * Create a new import job and forward the uploaded file to the importer service.
 * Body: multipart/form-data  — file, course_id, module_id?, parsing_mode?
 */
app.post(
  '/api/admin/question-imports',
  adminRequired,
  _qimportUpload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { course_id, module_id, parsing_mode } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required.' });

    // Detect source_type from mime
    const mime = req.file.mimetype;
    let source_type = 'mixed';
    if (mime === 'application/pdf') source_type = 'pdf';
    else if (mime.includes('word') || mime.includes('docx')) source_type = 'docx';
    else if (mime.startsWith('image/')) source_type = 'image';

    const jobId = uuid();
    const ts    = now();

    await db.run(
      `INSERT INTO question_import_jobs
         (id, instructor_user_id, course_id, module_id, source_filename, source_type,
          status, parsing_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [jobId, req.user.sub, course_id, module_id || null,
       req.file.originalname, source_type, parsing_mode || 'auto', ts]
    );

    // Forward to importer microservice asynchronously
    const importerAvailable = !!process.env.IMPORTER_URL;
    if (importerAvailable) {
      // Fire-and-forget — importer POSTs results back via /api/admin/question-imports/:id/results
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname, contentType: mime });
      form.append('job_id', jobId);
      form.append('parsing_mode', parsing_mode || 'auto');

      const fetchFn = globalThis.fetch || require('node-fetch');
      const headers = form.getHeaders ? form.getHeaders() : {};
      if (LMS_API_KEY) headers.Authorization = `Bearer ${LMS_API_KEY}`;
      fetchFn(`${IMPORTER_URL}/parse`, {
        method  : 'POST',
        headers,
        body    : form,
      }).catch(err => console.error('[QImport] Failed to reach importer service:', err.message));
    }

    const job = await db.get('SELECT * FROM question_import_jobs WHERE id = ?', [jobId]);
    res.status(201).json({ job, importer_queued: importerAvailable });
  })
);

/**
 * GET /api/admin/question-imports/:id
 * Get job status + counters.
 */
app.get('/api/admin/question-imports/:id', adminRequired, asyncHandler(async (req, res) => {
  const job = await db.get('SELECT * FROM question_import_jobs WHERE id = ?', [req.params.id]);
  if (!job) return res.status(404).json({ error: 'Import job not found.' });
  if (job.error_log) job.error_log = parseJson(job.error_log, []);
  res.json({ job });
}));

/**
 * POST /api/admin/question-imports/:id/results  (called by importer microservice)
 * Receives parsed question items and image assets from the importer.
 * Protected by LMS_API_KEY (Bearer token) instead of user JWT.
 */
app.post('/api/admin/question-imports/:id/results', asyncHandler(async (req, res) => {
  // Validate service-to-service auth
  const incoming = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!LMS_API_KEY) {
    return res.status(503).json({ error: 'Import callback is disabled until LMS_API_KEY is configured.' });
  }
  if (incoming !== LMS_API_KEY) {
    return res.status(401).json({ error: 'Invalid service API key.' });
  }

  const { id } = req.params;
  const { status, items = [], image_assets = [], error_message, ocr_used, total_detected } = req.body;

  const job = await db.get('SELECT id FROM question_import_jobs WHERE id = ?', [id]);
  if (!job) return res.status(404).json({ error: 'Import job not found.' });

  const ts = now();

  // Persist image assets first so items can reference them
  const assetIdMap = {}; // index → db id
  for (let i = 0; i < image_assets.length; i++) {
    const a   = image_assets[i];
    const aid = uuid();
    await db.run(
      `INSERT INTO question_assets
         (id, import_job_id, storage_path, original_filename, mime_type, width, height, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [aid, id, a.storage_path, a.original_filename || null,
       a.mime_type || 'image/png', a.width || null, a.height || null, ts]
    );
    assetIdMap[i] = aid;
  }

  // Persist question items
  for (let i = 0; i < items.length; i++) {
    const q = items[i];
    await db.run(
      `INSERT INTO question_import_items
         (id, import_job_id, detected_question_number, question_text,
          option_json, correct_answer_json, explanation_text,
          question_type, confidence_score, raw_ocr_text,
          review_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [uuid(), id,
       q.detected_question_number || (i + 1),
       q.question_text,
       typeof q.option_json === 'string'         ? q.option_json         : jsonCol(q.option_json),
       typeof q.correct_answer_json === 'string' ? q.correct_answer_json : jsonCol(q.correct_answer_json),
       q.explanation_text || null,
       q.question_type || 'single',
       q.confidence_score ?? 0,
       q.raw_ocr_text || null,
       ts]
    );
  }

  // Update job
  const errorLog = error_message ? JSON.stringify([error_message]) : null;
  await db.run(
    `UPDATE question_import_jobs
     SET status = ?, total_detected = ?, ocr_used = ?,
         error_log = ?, completed_at = ?
     WHERE id = ?`,
    [status || 'review',
     total_detected ?? items.length,
     ocr_used ? 1 : 0,
     errorLog,
     status === 'failed' || status === 'review' ? ts : null,
     id]
  );

  res.json({ ok: true, items_stored: items.length, assets_stored: image_assets.length });
}));

/**
 * GET /api/admin/question-imports/:id/items
 * List all extracted question items for a job.
 */
app.get('/api/admin/question-imports/:id/items', adminRequired, asyncHandler(async (req, res) => {
  const { review_status } = req.query;
  const params = [req.params.id];
  let sql = `SELECT * FROM question_import_items WHERE import_job_id = ?`;
  if (review_status) { sql += ' AND review_status = ?'; params.push(review_status); }
  sql += ' ORDER BY detected_question_number ASC';

  const items = await db.all(sql, params);
  items.forEach(item => {
    item.option_json         = parseJson(item.option_json, []);
    item.correct_answer_json = parseJson(item.correct_answer_json, []);
  });
  res.json({ items });
}));

/**
 * PATCH /api/admin/question-imports/:id/items/:itemId
 * Edit a single extracted question (stem, options, answer, type, difficulty, domain).
 */
app.patch('/api/admin/question-imports/:id/items/:itemId', adminRequired, asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const allowed = ['question_text','option_json','correct_answer_json','explanation_text',
                   'question_type','difficulty','domain','reviewer_note','review_status'];
  const updates = [];
  const vals    = [];

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`);
      vals.push(['option_json','correct_answer_json'].includes(key)
        ? (typeof req.body[key] === 'string' ? req.body[key] : jsonCol(req.body[key]))
        : req.body[key]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });

  vals.push(itemId);
  await db.run(`UPDATE question_import_items SET ${updates.join(', ')} WHERE id = ?`, vals);

  const item = await db.get('SELECT * FROM question_import_items WHERE id = ?', [itemId]);
  if (!item) return res.status(404).json({ error: 'Item not found.' });
  item.option_json         = parseJson(item.option_json, []);
  item.correct_answer_json = parseJson(item.correct_answer_json, []);
  res.json({ item });
}));

/**
 * POST /api/admin/question-imports/:id/items/:itemId/approve
 * Mark a single item as approved (does NOT publish to question_bank yet).
 */
app.post('/api/admin/question-imports/:id/items/:itemId/approve', adminRequired, asyncHandler(async (req, res) => {
  await db.run(
    `UPDATE question_import_items SET review_status = 'approved' WHERE id = ? AND import_job_id = ?`,
    [req.params.itemId, req.params.id]
  );
  // Update job counter
  const cnt = await db.get(
    `SELECT COUNT(*) AS n FROM question_import_items
     WHERE import_job_id = ? AND review_status = 'approved'`, [req.params.id]
  );
  await db.run(
    `UPDATE question_import_jobs SET total_approved = ? WHERE id = ?`,
    [cnt ? Number(cnt.n || cnt.count) : 0, req.params.id]
  );
  res.json({ ok: true });
}));

/**
 * POST /api/admin/question-imports/:id/publish
 * Publish all approved items from this job into question_bank.
 */
app.post('/api/admin/question-imports/:id/publish', adminRequired, asyncHandler(async (req, res) => {
  const job = await db.get('SELECT * FROM question_import_jobs WHERE id = ?', [req.params.id]);
  if (!job) return res.status(404).json({ error: 'Import job not found.' });

  const items = await db.all(
    `SELECT * FROM question_import_items WHERE import_job_id = ? AND review_status = 'approved'`,
    [req.params.id]
  );

  let published = 0;
  const ts = now();

  for (const item of items) {
    // Skip items already published to question_bank (idempotent)
    const alreadyPublished = await db.get(
      `SELECT id FROM question_bank WHERE source_import_item_id = ?`, [item.id]
    );
    if (alreadyPublished) { published++; continue; }

    const qid = uuid();
    await db.run(
      `INSERT INTO question_bank
         (id, course_id, module_id, domain, question_text, option_json, answer_json,
          explanation_text, difficulty, question_type, status, version,
          source_import_item_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?, ?, ?, ?)`,
      [qid,
       job.course_id,
       job.module_id || null,
       item.domain   || null,
       item.question_text,
       item.option_json,
       item.correct_answer_json,
       item.explanation_text || null,
       item.difficulty || 'medium',
       item.question_type || 'single',
       item.id,
       req.user.sub,
       ts, ts]
    );

    // Write revision record
    await db.run(
      `INSERT INTO question_revisions
         (question_id, changed_by, change_type, new_data_json, changed_at)
       VALUES (?, ?, 'import', ?, ?)`,
      [qid, req.user.sub,
       jsonCol({ source_item_id: item.id, job_id: job.id }),
       ts]
    );

    // Mark source item as published via reviewer_note (review_status CHECK only allows
    // 'pending'|'approved'|'rejected'|'duplicate'; we use reviewer_note as a published marker)
    await db.run(
      `UPDATE question_import_items
       SET reviewer_note = COALESCE(reviewer_note || ' ', '') || '[published:' || ? || ']'
       WHERE id = ?`,
      [qid, item.id]
    );

    published++;
  }

  await db.run(
    `UPDATE question_import_jobs
     SET status = 'published', total_published = ?, completed_at = ?
     WHERE id = ?`,
    [published, ts, req.params.id]
  );

  res.json({ ok: true, published });
}));


// =============================================================================
// QUESTION BANK — CRUD
// =============================================================================

/**
 * GET /api/admin/question-bank
 * List questions with optional filters: course_id, module_id, domain, difficulty, status, q (text search)
 */
app.get('/api/admin/question-bank', adminRequired, asyncHandler(async (req, res) => {
  const { course_id, module_id, domain, difficulty, status, q, limit = 50, offset = 0 } = req.query;

  let sql    = `SELECT qb.*, c.slug AS course_slug FROM question_bank qb JOIN courses c ON c.id = qb.course_id WHERE 1=1`;
  const params = [];

  if (course_id) { sql += ' AND qb.course_id = ?';  params.push(course_id); }
  if (module_id) { sql += ' AND qb.module_id = ?';  params.push(module_id); }
  if (domain)    { sql += ' AND qb.domain = ?';     params.push(domain); }
  if (difficulty){ sql += ' AND qb.difficulty = ?'; params.push(difficulty); }
  if (status)    { sql += ' AND qb.status = ?';     params.push(status); }
  if (q)         { sql += ` AND qb.question_text LIKE ?`; params.push(`%${q}%`); }

  // Build count query using the same WHERE clauses and params (safe, parameterized)
  let countSql = `SELECT COUNT(*) AS n FROM question_bank qb JOIN courses c ON c.id = qb.course_id WHERE 1=1`;
  const countParams = [];
  if (course_id) { countSql += ' AND qb.course_id = ?';  countParams.push(course_id); }
  if (module_id) { countSql += ' AND qb.module_id = ?';  countParams.push(module_id); }
  if (domain)    { countSql += ' AND qb.domain = ?';     countParams.push(domain); }
  if (difficulty){ countSql += ' AND qb.difficulty = ?'; countParams.push(difficulty); }
  if (status)    { countSql += ' AND qb.status = ?';     countParams.push(status); }
  if (q)         { countSql += ' AND qb.question_text LIKE ?'; countParams.push(`%${q}%`); }

  const total = await db.get(countSql, countParams);

  sql += ' ORDER BY qb.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const questions = await db.all(sql, params);
  questions.forEach(qrow => {
    qrow.option_json = parseJson(qrow.option_json, []);
    qrow.answer_json = parseJson(qrow.answer_json, []);
  });

  res.json({ questions, total: total ? Number(total.n || total.count) : 0 });
}));

/**
 * POST /api/admin/question-bank
 * Manually create a question.
 */
app.post('/api/admin/question-bank', adminRequired, asyncHandler(async (req, res) => {
  const { course_id, module_id, domain, question_text, option_json,
          answer_json, explanation_text, difficulty, question_type } = req.body;

  if (!course_id || !question_text || !option_json || !answer_json) {
    return res.status(400).json({ error: 'course_id, question_text, option_json, answer_json required.' });
  }

  const qid = uuid();
  const ts  = now();

  await db.run(
    `INSERT INTO question_bank
       (id, course_id, module_id, domain, question_text, option_json, answer_json,
        explanation_text, difficulty, question_type, status, version,
        created_by, updated_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?, ?, ?, ?)`,
    [qid, course_id, module_id || null, domain || null, question_text,
     typeof option_json === 'string' ? option_json : jsonCol(option_json),
     typeof answer_json === 'string' ? answer_json : jsonCol(answer_json),
     explanation_text || null,
     difficulty || 'medium',
     question_type || 'single',
     req.user.sub, req.user.sub, ts, ts]
  );

  await db.run(
    `INSERT INTO question_revisions (question_id, changed_by, change_type, new_data_json, changed_at)
     VALUES (?, ?, 'create', ?, ?)`,
    [qid, req.user.sub, jsonCol({ question_text, difficulty, question_type }), ts]
  );

  const question = await db.get('SELECT * FROM question_bank WHERE id = ?', [qid]);
  question.option_json = parseJson(question.option_json, []);
  question.answer_json = parseJson(question.answer_json, []);
  res.status(201).json({ question });
}));

/**
 * PATCH /api/admin/question-bank/:questionId
 * Edit an existing question (increments version, writes revision record).
 */
app.patch('/api/admin/question-bank/:questionId', adminRequired, asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const existing = await db.get('SELECT * FROM question_bank WHERE id = ?', [questionId]);
  if (!existing) return res.status(404).json({ error: 'Question not found.' });

  const allowed = ['domain','question_text','option_json','answer_json','explanation_text',
                   'difficulty','question_type','status','module_id'];
  const updates = ['version = version + 1', 'updated_by = ?', 'updated_at = ?'];
  const vals    = [req.user.sub, now()];

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`);
      vals.push(['option_json','answer_json'].includes(key)
        ? (typeof req.body[key] === 'string' ? req.body[key] : jsonCol(req.body[key]))
        : req.body[key]);
    }
  }

  vals.push(questionId);
  await db.run(`UPDATE question_bank SET ${updates.join(', ')} WHERE id = ?`, vals);

  // Revision snapshot
  const prevJson = jsonCol({
    question_text: existing.question_text,
    option_json  : existing.option_json,
    answer_json  : existing.answer_json,
    difficulty   : existing.difficulty,
    status       : existing.status,
    version      : existing.version,
  });
  await db.run(
    `INSERT INTO question_revisions (question_id, changed_by, change_type, previous_data_json, new_data_json, changed_at)
     VALUES (?, ?, 'edit', ?, ?, ?)`,
    [questionId, req.user.sub, prevJson, jsonCol(req.body), now()]
  );

  const question = await db.get('SELECT * FROM question_bank WHERE id = ?', [questionId]);
  question.option_json = parseJson(question.option_json, []);
  question.answer_json = parseJson(question.answer_json, []);
  res.json({ question });
}));

/**
 * DELETE /api/admin/question-bank/:questionId
 * Archive (soft-delete) a question.
 */
app.delete('/api/admin/question-bank/:questionId', adminRequired, asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const existing = await db.get('SELECT id, status FROM question_bank WHERE id = ?', [questionId]);
  if (!existing) return res.status(404).json({ error: 'Question not found.' });

  const ts = now();
  await db.run(
    `UPDATE question_bank SET status = 'archived', updated_at = ?, updated_by = ? WHERE id = ?`,
    [ts, req.user.sub, questionId]
  );
  await db.run(
    `INSERT INTO question_revisions (question_id, changed_by, change_type, previous_data_json, changed_at)
     VALUES (?, ?, 'archive', ?, ?)`,
    [questionId, req.user.sub, jsonCol({ previous_status: existing.status }), ts]
  );
  res.json({ ok: true, archived: questionId });
}));

/**
 * GET /api/admin/question-bank/:questionId/revisions
 * Full edit history for a question.
 */
app.get('/api/admin/question-bank/:questionId/revisions', adminRequired, asyncHandler(async (req, res) => {
  const revisions = await db.all(
    `SELECT r.*, u.display_name AS changed_by_name
     FROM question_revisions r
     LEFT JOIN users u ON u.id = r.changed_by
     WHERE r.question_id = ?
     ORDER BY r.changed_at DESC`,
    [req.params.questionId]
  );
  revisions.forEach(r => {
    r.previous_data_json = parseJson(r.previous_data_json, null);
    r.new_data_json      = parseJson(r.new_data_json, null);
  });
  res.json({ revisions });
}));

/**
 * POST /api/admin/question-bank/export-js
 * Export published questions for a course as a JS module (QUIZ_BANK format).
 * Body: { course_id, module_id? }
 */
app.post('/api/admin/question-bank/export-js', adminRequired, asyncHandler(async (req, res) => {
  const { course_id, module_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id required.' });

  const params = [course_id];
  let sql = `SELECT * FROM question_bank WHERE course_id = ? AND status = 'published'`;
  if (module_id) { sql += ' AND module_id = ?'; params.push(module_id); }
  sql += ' ORDER BY created_at ASC';

  const questions = await db.all(sql, params);

  // Build QUIZ_BANK JS structure
  const exportData = questions.map(q => ({
    id          : q.id,
    domain      : q.domain,
    difficulty  : q.difficulty,
    type        : q.question_type,
    question    : q.question_text,
    options     : parseJson(q.option_json, []),
    answer      : parseJson(q.answer_json, []),
    explanation : q.explanation_text || '',
  }));

  const jsContent = `// Auto-generated by Study Buddy Question Bank Export\n// Course: ${course_id}\n// Generated: ${now()}\n// Questions: ${exportData.length}\n\nconst QUIZ_BANK = ${JSON.stringify(exportData, null, 2)};\n\nif (typeof module !== 'undefined') module.exports = QUIZ_BANK;\n`;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Content-Disposition', `attachment; filename="quiz_bank_${course_id}.js"`);
  res.send(jsContent);
}));


// =============================================================================
// ERROR HANDLER  — must be registered AFTER all routes
// =============================================================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const requestId = req.requestId || uuidv4();
  // OWASP A09: Log full error server-side
  securityLog('SERVER_ERROR', {
    path: req.path,
    method: req.method,
    status: err.status || 500,
    message: err.message,
    ip: req.ip,
    requestId,
  });
  console.error('[ERROR]', requestId, err.message);

  // OWASP A05: Never leak stack traces or internal details to client
  const status = err.status || 500;
  const clientMessage = status >= 500
    ? 'Internal server error.'   // Generic message for 5xx
    : (err.message || 'Request failed.');
  res.status(status).json({ error: clientMessage, requestId });
});


// =============================================================================
// START SERVER
// =============================================================================

// Only auto-listen when run directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Study Buddy API running on http://localhost:${PORT}`);
    console.log(`  Database : ${IS_PG ? process.env.DATABASE_URL : (process.env.DB_PATH || './db/studybuddy.db')}`);
    console.log(`  CORS     : ${CORS_ORIGIN}`);
  });
}

module.exports = app; // for testing
