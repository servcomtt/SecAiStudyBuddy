'use strict';

/**
 * OWASP Security Middleware for Study Buddy API
 *
 * Covers:
 *   A01:2021 – Broken Access Control     (CORS, auth checks)
 *   A02:2021 – Cryptographic Failures    (secure headers, HSTS)
 *   A03:2021 – Injection                 (input sanitization)
 *   A04:2021 – Insecure Design           (rate limiting)
 *   A05:2021 – Security Misconfiguration (helmet, disable x-powered-by)
 *   A06:2021 – Vulnerable Components     (handled in package.json)
 *   A07:2021 – Auth Failures             (brute-force protection, password policy)
 *   A08:2021 – Software/Data Integrity   (CSRF token headers)
 *   A09:2021 – Logging & Monitoring      (security event logger)
 *   A10:2021 – SSRF                      (URL validation)
 */

// ── Rate Limiter (in-memory, suitable for single-instance) ───────────────────

class RateLimiter {
  constructor({ windowMs = 60000, maxRequests = 100, message = 'Too many requests.' } = {}) {
    this.windowMs    = windowMs;
    this.maxRequests = maxRequests;
    this.message     = message;
    this._store      = new Map();
    // Cleanup expired entries every 5 minutes
    this._timer = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    if (this._timer.unref) this._timer.unref();
  }

  _cleanup() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, entry] of this._store) {
      if (entry.resetAt < cutoff) this._store.delete(key);
    }
  }

  _getKey(req) {
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  middleware() {
    return (req, res, next) => {
      const key = this._getKey(req);
      const now = Date.now();
      let entry = this._store.get(key);

      if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + this.windowMs };
        this._store.set(key, entry);
      }

      entry.count++;

      // Set standard rate-limit headers
      res.set('X-RateLimit-Limit', String(this.maxRequests));
      res.set('X-RateLimit-Remaining', String(Math.max(0, this.maxRequests - entry.count)));
      res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

      if (entry.count > this.maxRequests) {
        res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        return res.status(429).json({ error: this.message });
      }
      next();
    };
  }
}

// ── Security Headers (OWASP A05 + A02) ──────────────────────────────────────

function securityHeaders() {
  return (req, res, next) => {
    // Prevent MIME sniffing
    res.set('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.set('X-Frame-Options', 'DENY');

    // XSS protection (legacy browsers)
    res.set('X-XSS-Protection', '0');  // Modern recommendation: disable buggy filter

    // Referrer policy — don't leak full URL
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy — disable dangerous APIs
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Content Security Policy
    res.set('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // SPA needs inline scripts
      "style-src 'self' 'unsafe-inline'",   // SPA inline styles
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '));

    // HSTS — force HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Remove Express fingerprint
    res.removeHeader('X-Powered-By');

    next();
  };
}

// ── Input Sanitization (OWASP A03) ───────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,       // onclick=, onerror=, etc.
  /data:text\/html/i,
  /vbscript:/i,
];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Replace HTML entities for angle brackets
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function deepSanitize(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      // Block prototype pollution
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      clean[k] = deepSanitize(v);
    }
    return clean;
  }
  return obj;
}

function inputSanitizer() {
  return (req, res, next) => {
    // Ollama proxy forwards raw JSON to the local model; do not escape < > in prompts.
    if (req.path && String(req.path).startsWith('/sb-ollama/')) {
      return next();
    }
    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = deepSanitize(req.query);
    }
    next();
  };
}

// ── Request Size Limiter (OWASP A04) ─────────────────────────────────────────

function bodySizeLimit(maxBytes = 1024 * 1024) {  // 1 MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      return res.status(413).json({ error: 'Request body too large.' });
    }
    next();
  };
}

// ── Password Policy (OWASP A07) ─────────────────────────────────────────────

const PASSWORD_POLICY = {
  minLength:    12,
  maxLength:    128,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSpecial: true,
};

function validatePassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters.`);
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must be at most ${PASSWORD_POLICY.maxLength} characters.`);
  }
  if (PASSWORD_POLICY.requireUpper && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (PASSWORD_POLICY.requireLower && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (PASSWORD_POLICY.requireDigit && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit.');
  }
  if (PASSWORD_POLICY.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  // Check for common weak passwords
  const COMMON_WEAK = ['password', '12345678', 'qwerty', 'admin', 'letmein', 'welcome', 'changeme'];
  if (COMMON_WEAK.some(w => password.toLowerCase().includes(w))) {
    errors.push('Password contains a commonly-used word and is too easy to guess.');
  }

  return { valid: errors.length === 0, errors };
}

// ── Email Validation (OWASP A03) ─────────────────────────────────────────────

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 simplified — reject obvious injection attempts
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!re.test(email)) return false;
  if (email.length > 254) return false;   // RFC 5321 max
  return true;
}

// ── Security Event Logger (OWASP A09) ────────────────────────────────────────

function securityLog(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };
  // In production, ship to SIEM/log aggregator
  console.log('[SECURITY]', JSON.stringify(entry));
}

// ── Account Lockout (OWASP A07) ─────────────────────────────────────────────

class AccountLockout {
  constructor({ maxAttempts = 5, lockoutMinutes = 15 } = {}) {
    this.maxAttempts    = maxAttempts;
    this.lockoutMs      = lockoutMinutes * 60 * 1000;
    this._store         = new Map();
    this._timer = setInterval(() => this._cleanup(), 10 * 60 * 1000);
    if (this._timer.unref) this._timer.unref();
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.resetAt) this._store.delete(key);
    }
  }

  recordFailure(identifier) {
    const now = Date.now();
    let entry = this._store.get(identifier);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.lockoutMs };
      this._store.set(identifier, entry);
    }
    entry.count++;
    if (entry.count >= this.maxAttempts) {
      securityLog('ACCOUNT_LOCKED', { identifier, attempts: entry.count });
    }
    return entry.count;
  }

  isLocked(identifier) {
    const entry = this._store.get(identifier);
    if (!entry) return false;
    if (Date.now() > entry.resetAt) {
      this._store.delete(identifier);
      return false;
    }
    return entry.count >= this.maxAttempts;
  }

  reset(identifier) {
    this._store.delete(identifier);
  }
}

// ── CSRF Protection Header Check (OWASP A08) ────────────────────────────────
// For API-only servers: require a custom header on state-changing requests.
// Browsers won't send custom headers cross-origin without CORS preflight approval.

function csrfHeaderCheck() {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    // Check for custom header (any value) — proves request is from our app
    if (!req.headers['x-requested-with'] && !req.headers['x-csrf-token']) {
      // Allow if it's a same-origin request with JSON content type
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/json')) return next();
      return res.status(403).json({ error: 'Missing CSRF protection header.' });
    }
    next();
  };
}

// ── Service-to-service API key auth ─────────────────────────────────────────

function readServiceApiKey(req) {
  return (
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
    req.headers['x-orchestrator-key'] ||
    req.headers['x-service-key'] ||
    ''
  );
}

function serviceApiKeyAuth(getExpectedKey, { serviceName = 'service' } = {}) {
  return (req, res, next) => {
    const expected = typeof getExpectedKey === 'function' ? getExpectedKey() : getExpectedKey;
    if (!expected) {
      return res.status(503).json({ error: `${serviceName} authentication is not configured.` });
    }
    if (readServiceApiKey(req) !== expected) {
      securityLog('SERVICE_AUTH_FAILURE', { service: serviceName, path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    next();
  };
}

function assertProductionSecrets(checks) {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = checks
    .filter(([, value, insecureValues = []]) => !value || insecureValues.includes(value))
    .map(([name]) => name);
  if (missing.length) {
    console.error(`[FATAL] Insecure or missing production secrets: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function isSameServiceOrigin(targetUrl, baseUrl) {
  try {
    return new URL(targetUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  RateLimiter,
  securityHeaders,
  inputSanitizer,
  bodySizeLimit,
  validatePassword,
  validateEmail,
  securityLog,
  AccountLockout,
  csrfHeaderCheck,
  serviceApiKeyAuth,
  assertProductionSecrets,
  isSameServiceOrigin,
  PASSWORD_POLICY,
};
