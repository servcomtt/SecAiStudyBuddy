/**
 * Study Buddy — Database Sync Client  v1.0
 * =========================================
 * Drop-in layer between the SPA and the Study Buddy API server.
 *
 * Load this BEFORE labs.js and the main inline <script>:
 *   <script src="db-client.js"></script>
 *
 * What it does:
 *   1. Wraps saveState() / loadSettings() / saveSettings() so every write
 *      also syncs to the server (best-effort, non-blocking).
 *   2. On page load, if the user is signed in, fetches server state and
 *      merges it with localStorage (server wins on conflicts).
 *   3. Injects a minimal login/register UI into the topbar when no token.
 *   4. Queues failed sync calls and retries them when back online.
 *   5. Falls back silently to localStorage-only when the server is unreachable.
 *
 * Configuration (set before this script loads, or rely on defaults):
 *   window.SB_API_URL  = 'http://localhost:3001'  // API server base URL
 *   window.SB_COURSE   = 'secaiplus'               // current course slug
 */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────

  const API_URL    = window.SB_API_URL   || 'http://localhost:3001';
  const COURSE     = window.SB_COURSE    || 'secaiplus';
  const TOKEN_KEY  = 'sb_token';
  const USER_KEY   = 'sb_user';
  const QUEUE_KEY  = 'sb_sync_queue';

  // ── Token helpers ─────────────────────────────────────────────────────────

  function getToken()       { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
  function setToken(t)      { try { localStorage.setItem(TOKEN_KEY, t); } catch {} }
  function clearToken()     { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {} }
  function getUser()        { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }
  function setUser(u)       { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {} }
  function isLoggedIn()     { return !!getToken(); }

  // ── Fetch wrapper ─────────────────────────────────────────────────────────

  async function apiFetch(method, path, body) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    // AbortSignal.timeout() is not available in Safari < 16 / Firefox < 100.
    // Use an AbortController + setTimeout for broad compatibility.
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);
    let res;
    try {
      res = await fetch(API_URL + path, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (res.status === 401) { clearToken(); renderAuthUI(); return null; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  // ── Offline sync queue ────────────────────────────────────────────────────
  // Holds {method, path, body} objects; drained on next online event.

  function enqueue(item) {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push({ ...item, ts: Date.now() });
      // Keep at most 50 queued items to avoid unbounded growth
      if (q.length > 50) q.splice(0, q.length - 50);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {}
  }

  async function drainQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!q.length) return;
      const failed = [];
      for (const item of q) {
        try { await apiFetch(item.method, item.path, item.body); }
        catch { failed.push(item); }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } catch {}
  }

  window.addEventListener('online', () => { if (isLoggedIn()) drainQueue(); });

  // ── Best-effort sync helper ────────────────────────────────────────────────
  // Sends to server; on failure, queues for later retry. Never throws.

  async function syncToServer(method, path, body) {
    if (!isLoggedIn()) return;
    try {
      await apiFetch(method, path, body);
    } catch {
      enqueue({ method, path, body });
    }
  }

  // ── Auth: login / register / logout ───────────────────────────────────────

  window.SbAuth = {

    async login(email, password) {
      const data = await apiFetch('POST', '/api/auth/login', { email, password });
      if (!data) return null;
      setToken(data.token);
      setUser(data.user);
      await SbAuth.syncFromServer();
      renderAuthUI();
      return data.user;
    },

    async register(email, password, display_name) {
      const data = await apiFetch('POST', '/api/auth/register', { email, password, display_name });
      if (!data) return null;
      setToken(data.token);
      setUser(data.user);
      renderAuthUI();
      return data.user;
    },

    logout() {
      clearToken();
      // Keep localStorage state so offline use still works
      renderAuthUI();
    },

    async syncFromServer() {
      if (!isLoggedIn()) return;
      try {
        // Pull settings
        const me = await apiFetch('GET', '/api/auth/me');
        if (me?.settings_json && Object.keys(me.settings_json).length) {
          try { localStorage.setItem('dsb_settings', JSON.stringify(me.settings_json)); } catch {}
          if (typeof applySettings === 'function') applySettings(me.settings_json);
        }

        // Pull module progress
        const progress = await apiFetch('GET', `/api/progress/${COURSE}`);
        if (progress) {
          try {
            const localState = JSON.parse(localStorage.getItem(`${COURSE}_state`) || '{}');
            // Server wins: merge server data into local state
            for (const [slug, mp] of Object.entries(progress)) {
              if (!localState.progress) localState.progress = {};
              if (!localState.notes)    localState.notes    = {};
              if (!localState.topicsSeen) localState.topicsSeen = {};
              if (!localState.quizScore)  localState.quizScore  = {};
              if (!localState.quizCorrect)  localState.quizCorrect  = {};
              if (!localState.quizAttempted) localState.quizAttempted = {};
              if (!localState.fcIndex)   localState.fcIndex   = {};
              if (!localState.chTab)     localState.chTab     = {};
              if (!localState.completed) localState.completed = [];

              localState.progress[slug]      = mp.progress_pct;
              localState.notes[slug]         = mp.notes_text || '';
              localState.topicsSeen[slug]    = mp.topics_seen || [];
              localState.quizScore[slug]     = mp.quiz_score || 0;
              localState.quizCorrect[slug]   = mp.quiz_correct || 0;
              localState.quizAttempted[slug] = mp.quiz_attempted || 0;
              localState.fcIndex[slug]       = mp.flashcard_index || 0;
              localState.chTab[slug]         = mp.active_tab || 0;
              if (mp.is_complete && !localState.completed.includes(slug))
                localState.completed.push(slug);
            }
            localStorage.setItem(`${COURSE}_state`, JSON.stringify(localState));
            // Refresh the in-memory state object if the SPA has loaded it
            if (typeof state !== 'undefined' && typeof updateProgressUI === 'function') {
              try { Object.assign(state, localState); updateProgressUI(); } catch {}
            }
          } catch {}
        }
      } catch {
        // Server unreachable — silently use localStorage
      }
    }
  };

  // ── Patch saveState ────────────────────────────────────────────────────────
  // Called after every user interaction. We piggy-back server sync here.

  let _patchApplied    = false;
  let _pushDebounceId  = null;

  function patchSaveState() {
    if (_patchApplied) return;
    if (typeof saveState !== 'function') return; // not yet loaded
    _patchApplied = true;

    const _orig = saveState;
    window.saveState = function () {
      _orig();                          // always write localStorage first
      debouncedPushProgress();          // debounced fire-and-forget to server
    };
  }

  // Debounce: wait 2 s of inactivity before sending progress.
  // This prevents 8-requests-per-keystroke bursts when the user types notes.
  function debouncedPushProgress() {
    if (_pushDebounceId) clearTimeout(_pushDebounceId);
    _pushDebounceId = setTimeout(() => {
      _pushDebounceId = null;
      pushProgressToServer();
    }, 2000);
  }

  async function pushProgressToServer() {
    if (!isLoggedIn()) return;
    try {
      const s = JSON.parse(localStorage.getItem(`${COURSE}_state`) || '{}');
      const chapters = Object.keys(s.progress || {});
      for (const ch of chapters) {
        await syncToServer('PUT', `/api/progress/${COURSE}/${ch}`, {
          progress_pct:    s.progress?.[ch]       || 0,
          active_tab:      s.chTab?.[ch]          || 0,
          topics_seen:     s.topicsSeen?.[ch]     || [],
          topic_current:   s.topicCurrent?.[ch]   || 0,
          flashcard_index: s.fcIndex?.[ch]        || 0,
          quiz_index:      s.quizIndex?.[ch]      || 0,
          quiz_score:      s.quizScore?.[ch]      || null,
          quiz_correct:    s.quizCorrect?.[ch]    || 0,
          quiz_attempted:  s.quizAttempted?.[ch]  || 0,
          notes_text:      s.notes?.[ch]          || null
        });
      }
    } catch {}
  }

  // ── Patch saveSettings ─────────────────────────────────────────────────────

  function patchSaveSettings() {
    if (typeof saveSettings !== 'function') return;
    const _orig = saveSettings;
    window.saveSettings = function (s) {
      _orig(s);
      syncToServer('PATCH', '/api/auth/settings', { settings: s });
    };
  }

  // ── Auth UI ────────────────────────────────────────────────────────────────
  // Injects a tiny login widget into #topbar when no token is present.

  function renderAuthUI() {
    let container = document.getElementById('sb-auth-widget');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sb-auth-widget';
      container.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:8px;flex-shrink:0';
      const topbarActions = document.querySelector('#topbar .topbar-actions');
      if (topbarActions) topbarActions.prepend(container);
    }

    if (isLoggedIn()) {
      const user = getUser();
      container.innerHTML = `
        <span style="font-size:12px;color:var(--text-muted);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
              title="${user?.email || ''}">
          👤 ${user?.display_name || user?.email || 'Signed in'}
        </span>
        <button onclick="SbAuth.logout()"
          style="font-size:12px;padding:5px 10px;border-radius:6px;border:1.5px solid var(--border);
                 background:none;color:var(--text-muted);cursor:pointer">
          Sign out
        </button>`;
    } else {
      container.innerHTML = `
        <button onclick="SbUi.openAuthModal('login')"
          style="font-size:12px;padding:5px 14px;border-radius:6px;
                 border:1.5px solid var(--primary);background:none;
                 color:var(--primary);font-weight:600;cursor:pointer">
          Sign in
        </button>
        <button onclick="SbUi.openAuthModal('register')"
          style="font-size:12px;padding:5px 14px;border-radius:6px;
                 background:var(--primary);color:#fff;border:none;
                 font-weight:600;cursor:pointer">
          Register
        </button>`;
    }
  }

  // ── Auth Modal ─────────────────────────────────────────────────────────────

  window.SbUi = {

    openAuthModal(mode) {
      let modal = document.getElementById('sb-auth-modal-backdrop');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sb-auth-modal-backdrop';
        modal.style.cssText = `
          position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:500;
          display:flex;align-items:center;justify-content:center`;
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
      }
      modal.innerHTML = '';
      const isLogin = mode === 'login';
      const panel = document.createElement('div');
      panel.style.cssText = `
        background:#fff;border-radius:16px;padding:32px;width:360px;max-width:96vw;
        box-shadow:0 24px 64px rgba(0,0,0,0.28);font-family:inherit`;
      panel.innerHTML = `
        <h3 style="margin:0 0 6px;font-size:18px">${isLogin ? '🔐 Sign In' : '📝 Create Account'}</h3>
        <p style="margin:0 0 20px;font-size:13px;color:#5f6368">
          ${isLogin ? 'Sync your study progress across devices.' : 'Create a free account to save your progress.'}
        </p>
        ${!isLogin ? `<input id="sb-auth-name" type="text" placeholder="Display name (optional)"
          style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;
                 font-size:14px;margin-bottom:10px;box-sizing:border-box">` : ''}
        <input id="sb-auth-email" type="email" placeholder="Email address" required
          style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;
                 font-size:14px;margin-bottom:10px;box-sizing:border-box">
        <input id="sb-auth-pass" type="password" placeholder="Password (min 8 characters)" required
          style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;
                 font-size:14px;margin-bottom:4px;box-sizing:border-box">
        <div id="sb-auth-error" style="color:#ea4335;font-size:12px;min-height:18px;margin-bottom:10px"></div>
        <button id="sb-auth-submit"
          style="width:100%;padding:11px;background:#1a73e8;color:#fff;border:none;
                 border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:12px">
          ${isLogin ? 'Sign In' : 'Create Account'}
        </button>
        <p style="text-align:center;font-size:12px;color:#5f6368;margin:0">
          ${isLogin
            ? `No account? <a href="#" onclick="SbUi.openAuthModal('register');return false"
                style="color:#1a73e8;font-weight:600">Register free</a>`
            : `Have an account? <a href="#" onclick="SbUi.openAuthModal('login');return false"
                style="color:#1a73e8;font-weight:600">Sign in</a>`}
        </p>`;

      modal.appendChild(panel);
      document.getElementById('sb-auth-email').focus();

      // Keyboard submit
      panel.addEventListener('keydown', e => {
        if (e.key === 'Escape') modal.remove();
        if (e.key === 'Enter') document.getElementById('sb-auth-submit').click();
      });

      document.getElementById('sb-auth-submit').onclick = async () => {
        const email    = document.getElementById('sb-auth-email')?.value?.trim();
        const password = document.getElementById('sb-auth-pass')?.value;
        const name     = document.getElementById('sb-auth-name')?.value?.trim();
        const errEl    = document.getElementById('sb-auth-error');
        const btn      = document.getElementById('sb-auth-submit');

        if (!email || !password) { errEl.textContent = 'Email and password are required.'; return; }
        btn.textContent = isLogin ? 'Signing in…' : 'Creating account…';
        btn.disabled = true;
        errEl.textContent = '';

        try {
          const user = isLogin
            ? await SbAuth.login(email, password)
            : await SbAuth.register(email, password, name || undefined);
          if (user) {
            modal.remove();
            if (typeof updateProgressUI === 'function') updateProgressUI();
          }
        } catch (err) {
          errEl.textContent = err.message || 'Something went wrong. Try again.';
          btn.textContent = isLogin ? 'Sign In' : 'Create Account';
          btn.disabled = false;
        }
      };
    }
  };

  // ── Lab helpers ────────────────────────────────────────────────────────────
  //
  // Two execution modes are supported transparently:
  //
  //   DOCKER mode  (when window.SB_ORCH_URL is set)
  //     Provisions an isolated Docker container via the Lab Orchestrator,
  //     sends code to the container for real server-side execution, and
  //     reports completion back to the LMS via an orchestrator webhook.
  //
  //   SKULPT mode  (fallback — offline or no orchestrator configured)
  //     All Python runs in-browser via Skulpt.  Results are reported
  //     directly to the LMS API from the client.
  //
  // Public API (consumed by labs.js):
  //   SbLabs.startAttempt(activityId)          → { attempt_id, attempt_number }
  //   SbLabs.provision(activityId, labType)    → { session_id } | null
  //   SbLabs.execCode(sessionId, code, timeout) → { stdout, stderr, exit_code }
  //   SbLabs.resetSession(sessionId)           → void
  //   SbLabs.cleanupSession(sessionId)         → void
  //   SbLabs.submitAttempt(attemptId, opts)    → void  (LMS direct)
  //   SbLabs.submitDockerAttempt(sessionId, opts) → void (via orchestrator)
  //   SbLabs.logEvent(attemptId, type, payload) → void
  //   SbLabs.isDockerMode()                   → boolean

  const ORCH_DIRECT = window.SB_ORCH_URL || null;
  const ORCH_PROXY_BASE = API_URL + '/api/labs/orchestrator';

  /** Fetch helper for lab orchestrator calls (JWT-protected LMS proxy by default). */
  async function orchFetch(method, path, body) {
    const useProxy = !ORCH_DIRECT;
    const base = useProxy ? ORCH_PROXY_BASE : ORCH_DIRECT;
    const token = getToken();
    if (useProxy && !token) throw new Error('Sign in required for Docker lab mode.');
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = 'Bearer ' + token;
      res = await fetch(base + path, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
    } finally {
      clearTimeout(tid);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  window.SbLabs = {

    /** Returns true when Docker lab mode is available (proxy or legacy direct URL). */
    isDockerMode() { return !!(ORCH_DIRECT || ORCH_PROXY_BASE); },

    // ── LMS attempt management ───────────────────────────────────────────────

    /** Register a new attempt with the LMS and get back an attempt_id. */
    async startAttempt(activity_id) {
      if (!isLoggedIn()) return null;
      try {
        return await apiFetch('POST', '/api/labs/attempts', { activity_id });
      } catch { return null; }
    },

    /**
     * Submit final results directly to the LMS (Skulpt / offline path).
     * For the Docker path use submitDockerAttempt() instead.
     */
    async submitAttempt(attempt_id, { score, passed, time_spent_s, answer_json, feedback_json } = {}) {
      if (!isLoggedIn() || !attempt_id) return;
      await syncToServer('PUT', `/api/labs/attempts/${attempt_id}`, {
        status: 'submitted', score, passed: passed ? 1 : 0,
        time_spent_s, answer_json, feedback_json
      });
    },

    /** Fire-and-forget granular event logging to the LMS. */
    logEvent(attempt_id, event_type, payload = {}) {
      if (!isLoggedIn() || !attempt_id) return;
      syncToServer('POST', `/api/labs/attempts/${attempt_id}/events`, [
        { event_type, payload, ts: new Date().toISOString() }
      ]);
    },

    // ── Docker session management ────────────────────────────────────────────

    /**
     * Ask the orchestrator to provision (or reuse) a Docker container for
     * this user + activity.  Returns { session_id } on success, null on error.
     *
     * @param {string} activity_id  - matches labs.js LABS[ch].activities[n].id
     * @param {string} [lab_type]   - 'python' | 'sql'  (default 'python')
     * @param {string} [attempt_id] - LMS attempt_id so the orchestrator can
     *                                call the completion webhook correctly
     */
    async provision(activity_id, lab_type = 'python', attempt_id = null) {
      if (!this.isDockerMode()) return null;
      const user = getUser();
      if (!user) return null;
      try {
        return await orchFetch('POST', '/provision', {
          user_id: user.id,
          activity_id,
          lab_type,
          attempt_id
        });
      } catch (err) {
        console.warn('[SbLabs] provision failed:', err.message);
        return null;
      }
    },

    /**
     * Execute code inside a provisioned Docker container.
     * Returns { stdout, stderr, exit_code } — never throws.
     *
     * @param {string} session_id
     * @param {string} code         - Python (or SQL) source code
     * @param {number} [timeout=30] - per-execution timeout in seconds
     */
    async execCode(session_id, code, timeout = 30) {
      if (!this.isDockerMode() || !session_id) return { stdout: '', stderr: 'No active session.', exit_code: 1 };
      try {
        return await orchFetch('POST', `/exec/${session_id}`, { code, timeout });
      } catch (err) {
        return { stdout: '', stderr: err.message, exit_code: 1 };
      }
    },

    /**
     * Reset the /workspace directory inside the container to a clean state.
     * Call this when the student clicks a "Reset" or "Start Over" button.
     */
    async resetSession(session_id) {
      if (!this.isDockerMode() || !session_id) return;
      try { await orchFetch('POST', `/reset/${session_id}`, {}); } catch {}
    },

    /**
     * Destroy the container and free its resources.
     * Call this on page unload or when the user navigates away from the lab.
     */
    async cleanupSession(session_id) {
      if (!this.isDockerMode() || !session_id) return;
      try { await orchFetch('DELETE', `/cleanup/${session_id}`, null); } catch {}
    },

    /**
     * Submit final results through the orchestrator so it can call the LMS
     * webhook and mark the attempt as submitted server-side.
     *
     * @param {string} session_id
     * @param {{ score, passed, time_spent_s, answer_json, feedback_json }} opts
     */
    async submitDockerAttempt(session_id, { score, passed, time_spent_s, answer_json, feedback_json } = {}) {
      if (!this.isDockerMode() || !session_id) return;
      try {
        await orchFetch('POST', `/submit/${session_id}`, {
          score, passed: passed ? 1 : 0, time_spent_s, answer_json, feedback_json
        });
      } catch (err) {
        console.warn('[SbLabs] submitDockerAttempt failed:', err.message);
      }
    },

    /**
     * Fetch the signed-in user's attempt history for a specific activity.
     * Used by labs.js to populate the "Attempt History" zone in each lab card.
     * Returns an array (newest first) or null when offline / not signed in.
     */
    async getAttempts(activity_id) {
      if (!isLoggedIn()) return null;
      try {
        return await apiFetch('GET', `/api/labs/attempts?activity_id=${encodeURIComponent(activity_id)}&limit=4`);
      } catch { return null; }
    }
  };

  // ── Quiz recording helper ──────────────────────────────────────────────────
  // SbQuiz.record(quizType, moduleSlug, mode, questionCount, correctCount, score, answerJson)

  window.SbQuiz = {
    record({ quiz_type, module_slug, mode, question_count, correct_count, score, answer_json } = {}) {
      if (!isLoggedIn()) return;
      syncToServer('POST', '/api/quiz/attempts', {
        course_slug: COURSE, module_slug, quiz_type: quiz_type || 'chapter',
        mode: mode || 'training', question_count, correct_count, score, answer_json
      });
    }
  };

  // ── Certificate check ─────────────────────────────────────────────────────
  // SbCerts.get() → array of certificates for this user

  window.SbCerts = {
    async get() {
      if (!isLoggedIn()) return [];
      try { return (await apiFetch('GET', '/api/certificates')) || []; }
      catch { return []; }
    }
  };

  // ── Initialise on DOM ready ───────────────────────────────────────────────

  function init() {
    // Patch SPA functions once they're defined
    // (inline <script> comes after this file, so functions exist after DOMContentLoaded)
    document.addEventListener('DOMContentLoaded', async () => {
      renderAuthUI();
      patchSaveState();
      patchSaveSettings();

      if (isLoggedIn()) {
        await SbAuth.syncFromServer();
        await drainQueue();
      }
    });
  }

  init();

})();
