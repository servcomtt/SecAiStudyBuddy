/**
 * Study Buddy — Lab Orchestrator  v1.0
 * =====================================
 * Manages Docker containers that serve as isolated lab environments.
 * Called by the browser (via db-client.js) for code execution, and by
 * the LMS server for entitlement checks.
 *
 * Responsibilities:
 *   provision  → start a Docker container for one user+activity session
 *   exec       → forward code-run requests to the running container
 *   reset      → wipe the container workspace back to a clean state
 *   submit     → accept final results and POST a webhook to the LMS
 *   cleanup    → stop + remove the container
 *
 * Docker containers listen on port 8080 internally (a tiny HTTP runner).
 * The orchestrator binds each container to a random host port and proxies
 * requests through that port.
 *
 * Environment variables:
 *   PORT              Orchestrator HTTP port           (default 3002)
 *   LMS_URL           Base URL of the LMS server       (default http://localhost:3001)
 *   WEBHOOK_SECRET    Shared secret for LMS webhook    (default dev-webhook-secret)
 *   SESSION_TTL_MS    Idle TTL before auto-cleanup ms  (default 900000 = 15 min)
 *   LAB_IMAGE_PYTHON  Docker image for Python labs     (default studybuddy-python-lab:latest)
 *   LAB_IMAGE_SQL     Docker image for SQL labs        (default studybuddy-sql-lab:latest)
 *   CORS_ORIGIN       Allowed origin                   (default http://localhost:3000)
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const Docker  = require('dockerode');
const { v4: uuidv4 } = require('uuid');

// ── Config ────────────────────────────────────────────────────────────────────

const PORT           = parseInt(process.env.PORT           || '3002', 10);
const LMS_URL        = process.env.LMS_URL                 || 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET          || 'dev-webhook-secret';
const SESSION_TTL_MS = parseInt(process.env.SESSION_TTL_MS || String(15 * 60 * 1000), 10);
const CORS_ORIGIN    = process.env.CORS_ORIGIN             || 'http://localhost:3000';

const LAB_IMAGES = {
  python:  process.env.LAB_IMAGE_PYTHON || 'studybuddy-python-lab:latest',
  sql:     process.env.LAB_IMAGE_SQL    || 'studybuddy-sql-lab:latest',
  default: process.env.LAB_IMAGE_PYTHON || 'studybuddy-python-lab:latest'
};

// ── Docker client ─────────────────────────────────────────────────────────────
// Connects to /var/run/docker.sock (Linux/Mac) or named pipe (Windows).

const docker = new Docker();

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── Session store ─────────────────────────────────────────────────────────────
// In-memory map — restarting the orchestrator orphans containers.
// Production systems should persist this to Redis or a DB.
//
// session: {
//   sessionId, containerId, containerName, hostPort,
//   userId, activityId, attemptId, labType,
//   createdAt, lastActiveAt, timer
// }

const sessions = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Abort-compatible fetch (Node 18+ has global fetch; older nodes need node-fetch). */
async function safeFetch(url, opts = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(tid);
  }
}

// ── Session lifecycle ─────────────────────────────────────────────────────────

async function destroySession(sessionId, reason = 'cleanup') {
  const session = sessions.get(sessionId);
  if (!session) return;

  if (session.timer) clearTimeout(session.timer);
  sessions.delete(sessionId);

  try {
    const container = docker.getContainer(session.containerId);
    await container.stop({ t: 5 }).catch(() => {});
    await container.remove({ force: true }).catch(() => {});
    console.log(`[SESSION] Destroyed ${sessionId} (${reason})`);
  } catch (err) {
    console.error(`[SESSION] Failed to destroy ${sessionId}:`, err.message);
  }
}

function resetTTL(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  if (session.timer) clearTimeout(session.timer);
  session.timer = setTimeout(
    () => destroySession(sessionId, 'ttl_expired'),
    SESSION_TTL_MS
  );
  session.lastActiveAt = new Date().toISOString();
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Quick liveness probe — reports active session count.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', active_sessions: sessions.size, uptime_s: process.uptime() });
});


/**
 * POST /provision
 * Body: { user_id, activity_id, lab_type?, attempt_id? }
 *
 * Creates and starts a Docker container for the given user+activity.
 * Returns { session_id, status: 'ready' }.
 *
 * Container resources:
 *   CPU  : 50 % of one core   (adjustable via env)
 *   RAM  : 256 MB             (adjustable via env)
 *   Net  : host→none          (lab containers get no internet)
 */
app.post('/provision', asyncHandler(async (req, res) => {
  const {
    user_id, activity_id,
    lab_type  = 'python',
    attempt_id = null
  } = req.body;

  if (!user_id || !activity_id)
    return res.status(400).json({ error: 'user_id and activity_id are required.' });

  // One active session per user+activity is enough for this app.
  for (const [sid, s] of sessions) {
    if (s.userId === user_id && s.activityId === activity_id) {
      resetTTL(sid);
      return res.json({ session_id: sid, status: 'ready', reused: true });
    }
  }

  const image = LAB_IMAGES[lab_type] || LAB_IMAGES.default;
  const sessionId = uuidv4();

  let container;
  try {
    container = await docker.createContainer({
      Image: image,
      name:  `lab-${sessionId}`,
      Env: [
        `SESSION_ID=${sessionId}`,
        `ACTIVITY_ID=${activity_id}`,
        `USER_ID=${user_id}`
      ],
      ExposedPorts: { '8080/tcp': {} },
      HostConfig: {
        PortBindings:    { '8080/tcp': [{ HostPort: '0' }] }, // ephemeral host port
        Memory:          parseInt(process.env.LAB_MEMORY_BYTES || String(256 * 1024 * 1024), 10),
        CpuPeriod:       100000,
        CpuQuota:        parseInt(process.env.LAB_CPU_QUOTA   || '50000', 10),
        NetworkMode:     'none',  // no outbound internet from lab containers
        ReadonlyRootfs:  false,
        AutoRemove:      false    // we manage removal ourselves
      }
    });

    await container.start();

    // Discover the host-side ephemeral port Docker assigned
    const info     = await container.inspect();
    const hostPort = info.NetworkSettings.Ports['8080/tcp']?.[0]?.HostPort;
    if (!hostPort) throw new Error('Container started but no host port assigned.');

    // Wait until the runner inside the container is ready (up to 10 s)
    const ready = await waitForRunner(`http://localhost:${hostPort}`, 10000);
    if (!ready) throw new Error('Container runner did not become ready in time.');

    sessions.set(sessionId, {
      sessionId,
      containerId:   container.id,
      containerName: `lab-${sessionId}`,
      hostPort,
      userId:      user_id,
      activityId:  activity_id,
      attemptId:   attempt_id,
      labType:     lab_type,
      createdAt:   new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      timer: null
    });

    resetTTL(sessionId);

    console.log(`[SESSION] Provisioned ${sessionId} for user ${user_id} (port ${hostPort})`);
    res.status(201).json({ session_id: sessionId, status: 'ready' });

  } catch (err) {
    // Clean up partially-started container on error
    if (container) await container.remove({ force: true }).catch(() => {});
    console.error('[PROVISION]', err.message);
    res.status(500).json({ error: 'Failed to provision lab container.', detail: err.message });
  }
}));


/** Poll container runner until it responds to GET /health or times out. */
async function waitForRunner(baseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await safeFetch(`${baseUrl}/health`, {}, 1000);
      if (r.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}


/**
 * POST /exec/:sessionId
 * Body: { code, timeout?, stdin? }
 *
 * Forwards a code-execution request to the running container.
 * Returns { stdout, stderr, exit_code }.
 */
app.post('/exec/:sessionId', asyncHandler(async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found or expired.' });

  resetTTL(req.params.sessionId);

  const { code, timeout = 30, stdin = '' } = req.body;
  if (typeof code !== 'string' || !code.trim())
    return res.status(400).json({ error: 'code (string) is required.' });

  const execTimeoutMs = (Math.min(timeout, 60) + 5) * 1000; // 5s grace over user timeout
  try {
    const r = await safeFetch(
      `http://localhost:${session.hostPort}/exec`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, timeout: Math.min(timeout, 60), stdin })
      },
      execTimeoutMs
    );
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Container unreachable.', detail: err.message });
  }
}));


/**
 * POST /reset/:sessionId
 * Wipes the /workspace directory inside the container back to empty.
 */
app.post('/reset/:sessionId', asyncHandler(async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  resetTTL(req.params.sessionId);

  try {
    const r = await safeFetch(
      `http://localhost:${session.hostPort}/reset`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      8000
    );
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Container unreachable.', detail: err.message });
  }
}));


/**
 * POST /submit/:sessionId
 * Body: { score, passed, answer_json?, feedback_json?, time_spent_s? }
 *
 * Records the final result for an attempt and POSTs a webhook back to the LMS
 * so the LMS can update the lab_attempts table and award completion credit.
 */
app.post('/submit/:sessionId', asyncHandler(async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { score, passed, answer_json, feedback_json, time_spent_s } = req.body;

  // ── Notify LMS ──────────────────────────────────────────────────────────────
  let lmsAck = false;
  if (session.attemptId) {
    try {
      const wr = await safeFetch(
        `${LMS_URL}/api/labs/webhook/complete`,
        {
          method:  'POST',
          headers: {
            'Content-Type':    'application/json',
            'X-Webhook-Secret': WEBHOOK_SECRET
          },
          body: JSON.stringify({
            attempt_id:   session.attemptId,
            user_id:      session.userId,
            activity_id:  session.activityId,
            score,
            passed:       passed ? 1 : 0,
            time_spent_s: time_spent_s ?? null,
            answer_json:  answer_json  ?? null,
            feedback_json: feedback_json ?? null
          })
        },
        8000
      );
      lmsAck = wr.ok;
      if (!lmsAck) {
        const body = await wr.text().catch(() => '');
        console.warn(`[SUBMIT] LMS webhook returned ${wr.status}: ${body}`);
      }
    } catch (err) {
      console.error('[SUBMIT] LMS webhook failed:', err.message);
    }
  }

  res.json({ ok: true, session_id: req.params.sessionId, lms_ack: lmsAck });
}));


/**
 * GET /status/:sessionId
 * Returns session metadata (no container introspection — fast path).
 */
app.get('/status/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ status: 'not_found' });

  res.json({
    status:        'active',
    session_id:    req.params.sessionId,
    activity_id:   session.activityId,
    lab_type:      session.labType,
    created_at:    session.createdAt,
    last_active_at: session.lastActiveAt,
    ttl_remaining_s: Math.max(
      0,
      Math.round((SESSION_TTL_MS - (Date.now() - new Date(session.lastActiveAt).getTime())) / 1000)
    )
  });
});


/**
 * DELETE /cleanup/:sessionId
 * Explicitly stop + remove the container.
 */
app.delete('/cleanup/:sessionId', asyncHandler(async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  await destroySession(req.params.sessionId, 'user_request');
  res.json({ ok: true });
}));


/**
 * GET /sessions  (debug — omit in production or add auth)
 * Lists all active sessions.
 */
app.get('/sessions', (_req, res) => {
  const list = [];
  for (const [, s] of sessions) {
    list.push({
      session_id:    s.sessionId,
      user_id:       s.userId,
      activity_id:   s.activityId,
      lab_type:      s.labType,
      created_at:    s.createdAt,
      last_active_at: s.lastActiveAt
    });
  }
  res.json(list);
});


// ── Error handler ─────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});


// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Lab Orchestrator listening on http://localhost:${PORT}`);
  console.log(`  LMS URL     : ${LMS_URL}`);
  console.log(`  Session TTL : ${SESSION_TTL_MS / 1000}s`);
  console.log(`  Python image: ${LAB_IMAGES.python}`);
});

// Graceful shutdown — destroy all active sessions before exiting
async function shutdown(signal) {
  console.log(`\n[SHUTDOWN] ${signal} — cleaning up ${sessions.size} session(s)…`);
  const promises = [...sessions.keys()].map(id => destroySession(id, 'server_shutdown'));
  await Promise.allSettled(promises);
  process.exit(0);
}
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
