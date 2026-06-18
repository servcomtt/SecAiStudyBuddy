// ============================================================
// SecAIPlus Study Buddy — Practice Labs Engine v2.2
// Interactions: ClickMatch, ClickOrder, FillBlank, IDE CodeLab
//
// Python Runtime (two modes, selected automatically):
//   DOCKER mode  — when window.SB_ORCH_URL is set, provisions an
//                  isolated Docker container via the Lab Orchestrator.
//                  Real server-side execution; supports pandas, numpy, etc.
//   SKULPT mode  — in-browser Skulpt 1.2.0 when offline or no orchestrator.
//                  Zero-config fallback; no installation required.
// ============================================================

// ---- IDE State ----
var _ideState = {};

// ---- Docker session map  actId → session_id ----
var _dockerSessions = {};

// ---- IDE Code Lab Renderer ----
function renderCodeLab(actId) {
  const act = _getActivity(actId);
  if (!act) return;
  const container = document.getElementById('lab-body-' + actId);
  if (!container) return;

  // Separate markdown instruction cells and runnable code cells
  const codeCells = act.cells.filter(c => c.type === 'code');

  if (codeCells.length === 0) { container.innerHTML = '<p style="color:var(--text-muted)">No code cells defined.</p>'; return; }

  // Build tab labels (filename style)
  const tabLabels = codeCells.map((_, i) => {
    if (codeCells.length === 1) return 'main.py';
    if (i === 0) return 'setup.py';
    return 'exercise_' + i + '.py';
  });

  // Pair each code cell with the markdown block that precedes it in `cells` order
  let pendingMd = '';
  const instructions = [];
  for (const c of act.cells) {
    if (c.type === 'markdown') pendingMd = c.content;
    if (c.type === 'code') {
      instructions.push(pendingMd);
      pendingMd = '';
    }
  }

  // Init IDE state
  _ideState[actId] = {
    activeTab: 0,
    cells: codeCells.map(c => ({ code: c.code })),  // mutable copies
    origCells: codeCells.map(c => c.code),           // originals for reset
    tabLabels: tabLabels,
    instructions: instructions
  };

  // Runtime status badge — Docker takes priority over Skulpt
  const isDocker   = typeof SbLabs !== 'undefined' && SbLabs.isDockerMode();
  const skulptReady = typeof Sk !== 'undefined';
  const statusHtml = isDocker
    ? '<span class="ide-status-dot" style="color:#1a73e8">🐳 Docker lab</span>'
    : skulptReady
      ? '<span class="ide-status-dot" style="color:#2da44e">● Python 3 ready</span>'
      : '<span class="ide-status-dot" style="color:#cf222e">⚠ Runtime loading…</span>';

  // Build tabs HTML
  const tabsHtml = tabLabels.length > 1
    ? `<div class="ide-tabs" id="ide-tabs-${actId}">${tabLabels.map((label, i) =>
        `<span class="ide-tab${i === 0 ? ' active' : ''}" onclick="ideShowTab('${actId}',${i})">${label}</span>`
      ).join('')}</div>`
    : `<div class="ide-tabs" id="ide-tabs-${actId}"><span class="ide-tab active">${tabLabels[0]}</span></div>`;

  // Build instruction box (shown above IDE, changes per tab)
  const instrLabel = '<span class="ide-instr-label">📋 Exercise Instructions</span>';
  const firstInstr = instructions[0]
    ? `<div class="cl-md" id="ide-instr-${actId}">${instrLabel}${instructions[0]}</div>`
    : `<div class="cl-md" id="ide-instr-${actId}" style="display:none">${instrLabel}</div>`;

  // Build the IDE window
  const lineCount = (codeCells[0].code.match(/\n/g) || []).length + 1;
  const lineNums  = Array.from({length: lineCount}, (_, i) => i + 1).join('\n');
  const editorRows = Math.max(8, lineCount + 2);

  container.innerHTML = firstInstr + `
    <div class="ide-lab" id="ide-${actId}">
      <div class="ide-lab-header">
        <span class="ide-lab-badge">🧪 Lab Activity</span>
        <span class="ide-lab-title">${act.title}</span>
        <span class="ide-lab-counter" id="ide-counter-${actId}">${codeCells.length > 1 ? '1 / ' + codeCells.length : 'Python'}</span>
      </div>
      <div class="ide-toolbar">
        <button class="ide-run-btn" id="ide-run-${actId}" onclick="ideRun('${actId}')">▶ Run</button>
        <button class="ide-reset-btn" onclick="ideReset('${actId}')">↺ Reset</button>
        <div class="ide-toolbar-right">${statusHtml}</div>
      </div>
      ${tabsHtml}
      <div class="ide-editor-wrap">
        <div class="ide-line-nums" id="ide-lnum-${actId}">${lineNums}</div>
        <textarea class="ide-editor" id="ide-code-${actId}"
          spellcheck="false" rows="${editorRows}"
          oninput="ideUpdateLines('${actId}')"
          onscroll="ideSync('${actId}')"
          onkeydown="ideKeyDown(event,'${actId}')">${codeCells[0].code}</textarea>
      </div>
      <div class="ide-console">
        <div class="ide-console-header">
          <span class="ide-console-label">Console</span>
          <span class="ide-console-meta" id="ide-meta-${actId}">Click ▶ Run to execute</span>
        </div>
        <div class="ide-console-output idle" id="ide-out-${actId}">— output will appear here —</div>
      </div>
    </div>`;
}

// ---- IDE Helper Functions ----

function ideUpdateLines(actId) {
  const editor  = document.getElementById('ide-code-' + actId);
  const lineDiv = document.getElementById('ide-lnum-' + actId);
  if (!editor || !lineDiv) return;
  const count = (editor.value.match(/\n/g) || []).length + 1;
  lineDiv.textContent = Array.from({length: count}, (_, i) => i + 1).join('\n');
  lineDiv.scrollTop = editor.scrollTop;
}

function ideSync(actId) {
  const editor  = document.getElementById('ide-code-' + actId);
  const lineDiv = document.getElementById('ide-lnum-' + actId);
  if (editor && lineDiv) lineDiv.scrollTop = editor.scrollTop;
}

function ideKeyDown(e, actId) {
  // Tab key → insert 4 spaces instead of losing focus
  if (e.key === 'Tab') {
    e.preventDefault();
    const ta = e.target;
    const start = ta.selectionStart, end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
    ta.selectionStart = ta.selectionEnd = start + 4;
    ideUpdateLines(actId);
  }
}

function ideShowTab(actId, tabIdx) {
  const st = _ideState[actId];
  if (!st) return;
  const editor = document.getElementById('ide-code-' + actId);
  // Save current cell's edited code
  if (editor) st.cells[st.activeTab].code = editor.value;
  st.activeTab = tabIdx;
  // Update tab highlights
  const tabsEl = document.getElementById('ide-tabs-' + actId);
  if (tabsEl) tabsEl.querySelectorAll('.ide-tab').forEach((t, i) => t.classList.toggle('active', i === tabIdx));
  // Load new cell code
  if (editor) { editor.value = st.cells[tabIdx].code; ideUpdateLines(actId); }
  // Update counter
  const counter = document.getElementById('ide-counter-' + actId);
  if (counter && st.cells.length > 1) counter.textContent = (tabIdx + 1) + ' / ' + st.cells.length;
  // Update instruction box
  const instrEl = document.getElementById('ide-instr-' + actId);
  if (instrEl) {
    const instrText = st.instructions[tabIdx] || '';
    instrEl.innerHTML = instrText
      ? '<span class="ide-instr-label">📋 Exercise Instructions</span>' + instrText
      : '';
    instrEl.style.display = instrText ? 'block' : 'none';
  }
  // Clear console
  const out  = document.getElementById('ide-out-'  + actId);
  const meta = document.getElementById('ide-meta-' + actId);
  if (out)  { out.className  = 'ide-console-output idle'; out.textContent = '— output will appear here —'; }
  if (meta) meta.textContent = 'Click ▶ Run to execute';
}

function ideRun(actId) {
  const btn    = document.getElementById('ide-run-'  + actId);
  const editor = document.getElementById('ide-code-' + actId);
  const output = document.getElementById('ide-out-'  + actId);
  const meta   = document.getElementById('ide-meta-' + actId);
  if (!editor || !output) return;

  const code = editor.value;
  btn.innerHTML = '⏳ Running…';
  btn.disabled  = true;
  output.className  = 'ide-console-output running';
  output.textContent = '';
  if (meta) meta.textContent = 'executing…';

  // ── Docker path ───────────────────────────────────────────────────────────
  // Use the Lab Orchestrator for real server-side execution when configured.

  if (typeof SbLabs !== 'undefined' && SbLabs.isDockerMode()) {
    ideRunDocker(actId, code, btn, output, meta);
    return;
  }

  // ── Skulpt path (offline / no orchestrator) ───────────────────────────────

  if (typeof Sk === 'undefined') {
    output.className  = 'ide-console-output error';
    output.textContent = '❌ Python runtime not loaded. Check your internet connection and refresh the page.';
    btn.innerHTML = '▶ Run'; btn.disabled = false;
    if (meta) meta.textContent = 'runtime error';
    return;
  }

  let outText = '';
  function outf(text) {
    outText += text;
    output.textContent = outText;
    output.className = 'ide-console-output ok';
    output.scrollTop = output.scrollHeight;
  }
  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined)
      throw "File not found: '" + x + "'";
    return Sk.builtinFiles['files'][x];
  }

  Sk.configure({ output: outf, read: builtinRead, __future__: Sk.python3, execLimit: 15000 });
  Sk.misceval.asyncToPromise(() =>
    Sk.importMainWithBody('<stdin>', false, code, true)
  ).then(() => {
    if (!outText.trim()) { output.className = 'ide-console-output idle'; output.textContent = '(program ran — no output)'; }
    btn.innerHTML = '▶ Run'; btn.disabled = false;
    if (meta) meta.textContent = 'last run: ' + new Date().toLocaleTimeString();
  }).catch(err => {
    const msg = (err.toString ? err.toString() : String(err)).replace(/^.*?Error:/,'Error:');
    output.textContent = '❌ ' + msg;
    output.className   = 'ide-console-output error';
    btn.innerHTML = '▶ Run'; btn.disabled = false;
    if (meta) meta.textContent = '⚠ error — check code above';
  });
}

/**
 * Docker execution path for ideRun().
 * Provisions a container on first run (or reuses existing session),
 * forwards the code, and streams the result back into the console UI.
 */
async function ideRunDocker(actId, code, btn, output, meta) {
  try {
    // ── Ensure a session exists ──────────────────────────────────────────────
    let sessionId = _dockerSessions[actId];

    if (!sessionId) {
      if (meta) meta.textContent = '🐳 provisioning lab…';
      output.textContent = '⏳ Starting your isolated lab environment…';

      // Start an LMS attempt so the orchestrator can report back completion
      const attempt = typeof SbLabs !== 'undefined'
        ? await SbLabs.startAttempt(actId)
        : null;

      const provResult = await SbLabs.provision(
        actId,
        'python',
        attempt?.attempt_id || null
      );

      if (!provResult || !provResult.session_id) {
        throw new Error('Lab environment could not be started. Running in browser fallback instead.');
      }

      sessionId = provResult.session_id;
      _dockerSessions[actId] = sessionId;
      if (meta) meta.textContent = '🐳 container ready';
    }

    // ── Execute ───────────────────────────────────────────────────────────────
    if (meta) meta.textContent = 'executing…';
    const result = await SbLabs.execCode(sessionId, code, 30);

    // ── Display result ────────────────────────────────────────────────────────
    const hasOut    = result.stdout && result.stdout.trim().length > 0;
    const hasErr    = result.stderr && result.stderr.trim().length > 0;
    const succeeded = result.exit_code === 0;

    if (!hasOut && !hasErr) {
      output.className  = 'ide-console-output idle';
      output.textContent = '(program ran — no output)';
    } else {
      output.className  = succeeded ? 'ide-console-output ok' : 'ide-console-output error';
      output.textContent = (hasOut ? result.stdout : '') +
                           (hasErr ? (hasOut ? '\n' : '') + result.stderr : '');
      output.scrollTop  = output.scrollHeight;
    }

    btn.innerHTML = '▶ Run';
    btn.disabled  = false;
    if (meta) meta.textContent = 'last run: ' + new Date().toLocaleTimeString();

    // Log the run event to the LMS (best-effort)
    const attempt = typeof SbLabs !== 'undefined'
      ? null  // attempt_id stored in orchestrator session; not needed here
      : null;
    if (typeof SbLabs !== 'undefined') {
      SbLabs.logEvent(null, 'docker_code_run', {
        actId, exit_code: result.exit_code,
        stdout_len: (result.stdout || '').length
      });
    }

  } catch (err) {
    // Graceful fallback to Skulpt if Docker provisioning fails
    console.warn('[ideRunDocker] Docker exec failed, falling back to Skulpt:', err.message);
    delete _dockerSessions[actId];

    output.className  = 'ide-console-output error';
    output.textContent = '❌ Docker: ' + err.message + '\n↩ Falling back to browser runtime…';
    btn.innerHTML = '▶ Run';
    btn.disabled  = false;
    if (meta) meta.textContent = '⚠ docker error — retrying locally';

    // Re-run in Skulpt after a brief delay so user can read the message
    setTimeout(() => ideRun(actId), 1200);
  }
}

function ideReset(actId) {
  const st = _ideState[actId];
  if (!st) return;
  const tabIdx = st.activeTab;
  // Restore original code for current tab
  st.cells[tabIdx].code = st.origCells[tabIdx];
  const editor = document.getElementById('ide-code-' + actId);
  if (editor) { editor.value = st.origCells[tabIdx]; ideUpdateLines(actId); }
  // Clear console
  const out  = document.getElementById('ide-out-'  + actId);
  const meta = document.getElementById('ide-meta-' + actId);
  if (out)  { out.className = 'ide-console-output idle'; out.textContent = '— output will appear here —'; }
  if (meta) meta.textContent = 'Click ▶ Run to execute';
  // Wipe Docker workspace so files written in previous runs are removed
  const sessionId = _dockerSessions[actId];
  if (sessionId && typeof SbLabs !== 'undefined') {
    SbLabs.resetSession(sessionId);
  }
}

// Clean up Docker sessions when the user navigates away
window.addEventListener('beforeunload', function () {
  for (const actId in _dockerSessions) {
    const sid = _dockerSessions[actId];
    if (sid && typeof SbLabs !== 'undefined') SbLabs.cleanupSession(sid);
  }
});

// ---- Click-Match Engine ----
// Click an item from the bank to select it, then click a zone to place it.
// Click a placed item to return it to the bank.
let _cmState = {};

function initClickMatch(actId) {
  const act = _getActivity(actId);
  if (!act) return;
  const shuffled = [...act.items].sort(() => Math.random() - 0.5);
  _cmState[actId] = { placed: {}, selected: null, shuffled };
  _renderClickMatch(actId);
}

function _renderClickMatch(actId) {
  const act = _getActivity(actId);
  const st = _cmState[actId];
  const container = document.getElementById('lab-body-' + actId);
  if (!container) return;

  const placed = st.placed;
  const inZone = {};
  act.categories.forEach(c => inZone[c] = []);
  const unplaced = [];
  st.shuffled.forEach((item, i) => {
    if (placed[i] !== undefined) inZone[placed[i]].push({ item, i });
    else unplaced.push({ item, i });
  });

  const selClass = (i) => st.selected === i ? ' cm-selected' : '';

  container.innerHTML = `
    <p class="lab-hint">${_escapeHtml(act.instructions || 'Click a card to select it, then click a category zone to place it. Click a placed card to return it.')}</p>
    <div class="cm-bank" id="cm-bank-${actId}">
      ${unplaced.length === 0
        ? '<em class="cm-empty">All cards placed!</em>'
        : unplaced.map(({ item, i }) => `
          <div class="cm-card${selClass(i)}" onclick="cmSelectCard('${actId}',${i})" id="cm-card-${actId}-${i}">
            ${item.text}
          </div>`).join('')}
    </div>
    <div class="cm-zones">
      ${act.categories.map(cat => `
        <div class="cm-zone ${st.selected !== null ? 'cm-zone-active' : ''}" onclick="cmPlaceCard('${actId}','${cat.replace(/'/g,"\\'")}')">
          <div class="cm-zone-label">${cat}</div>
          <div class="cm-zone-items">
            ${(inZone[cat] || []).map(({ item, i }) => `
              <div class="cm-card placed${selClass(i)}" onclick="event.stopPropagation();cmReturnCard('${actId}',${i})" id="cm-card-${actId}-${i}">
                ${item.text}
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="lab-actions">
      <button class="btn btn-primary" onclick="checkClickMatch('${actId}')">✓ Check Answers</button>
      <button class="btn btn-outline" onclick="initClickMatch('${actId}')">↺ Reset</button>
    </div>
    <div class="lab-feedback" id="cm-feedback-${actId}" style="display:none"></div>`;
}

function cmSelectCard(actId, idx) {
  const st = _cmState[actId];
  st.selected = (st.selected === idx) ? null : idx;
  _renderClickMatch(actId);
}

function cmPlaceCard(actId, cat) {
  const st = _cmState[actId];
  if (st.selected === null) return;
  // Remove from any previous zone
  if (st.placed[st.selected] !== undefined) {
    delete st.placed[st.selected];
  }
  st.placed[st.selected] = cat;
  st.selected = null;
  _renderClickMatch(actId);
}

function cmReturnCard(actId, idx) {
  const st = _cmState[actId];
  delete st.placed[idx];
  st.selected = null;
  _renderClickMatch(actId);
}

function checkClickMatch(actId) {
  const act = _getActivity(actId);
  const st = _cmState[actId];
  const fb = document.getElementById('cm-feedback-' + actId);
  if (!fb) return;

  const total = st.shuffled.length;
  let unplaced = 0, correct = 0, wrong = 0;

  st.shuffled.forEach((item, i) => {
    if (st.placed[i] === undefined) { unplaced++; return; }
    if (st.placed[i] === item.category) correct++;
    else wrong++;
  });

  if (unplaced > 0) {
    fb.style.display = 'block';
    fb.className = 'lab-feedback warn';
    fb.textContent = `⚠️ ${unplaced} card(s) not placed yet. Click all cards into a category first.`;
    return;
  }

  fb.style.display = 'block';
  if (wrong === 0) {
    fb.className = 'lab-feedback success';
    fb.textContent = `✅ Perfect! All ${correct} cards correctly placed!`;
    // Show green on all placed cards
    st.shuffled.forEach((item, i) => {
      const card = document.getElementById(`cm-card-${actId}-${i}`);
      if (card) { card.classList.remove('wrong', 'right'); card.classList.add('right'); }
    });
  } else {
    fb.className = 'lab-feedback error';
    fb.innerHTML = `❌ ${correct} correct, ${wrong} incorrect. Wrong cards are highlighted — click them back and try again.`;
    st.shuffled.forEach((item, i) => {
      const card = document.getElementById(`cm-card-${actId}-${i}`);
      if (!card) return;
      card.classList.remove('wrong', 'right');
      if (st.placed[i] !== undefined) {
        card.classList.add(st.placed[i] === item.category ? 'right' : 'wrong');
      }
    });
  }
}

// ---- Click-Order Engine ----
// Each item has ↑ ↓ buttons to reorder. No drag needed.
let _coState = {};

function initClickOrder(actId) {
  const act = _getActivity(actId);
  if (!act) return;
  const shuffled = [...act.items].sort(() => Math.random() - 0.5);
  // Make sure shuffled differs from correct order
  let attempts = 0;
  while (shuffled.every((item, i) => item === act.answer[i]) && attempts < 10) {
    shuffled.sort(() => Math.random() - 0.5);
    attempts++;
  }
  _coState[actId] = { order: shuffled };
  _renderClickOrder(actId);
}

function _renderClickOrder(actId) {
  const st = _coState[actId];
  const container = document.getElementById('lab-body-' + actId);
  if (!container) return;
  const n = st.order.length;

  container.innerHTML = `
    <p class="lab-hint">${_escapeHtml(act.instructions || 'Use the ↑ ↓ buttons to arrange the items in the correct sequence.')}</p>
    <div class="co-list" id="co-list-${actId}">
      ${st.order.map((item, i) => `
        <div class="co-card" id="co-card-${actId}-${i}">
          <span class="co-num">${i + 1}</span>
          <span class="co-text">${item}</span>
          <div class="co-btns">
            <button class="co-btn" ${i === 0 ? 'disabled' : ''} onclick="coMove('${actId}',${i},-1)" title="Move up">↑</button>
            <button class="co-btn" ${i === n - 1 ? 'disabled' : ''} onclick="coMove('${actId}',${i},1)" title="Move down">↓</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="lab-actions">
      <button class="btn btn-primary" onclick="checkClickOrder('${actId}')">✓ Check Order</button>
      <button class="btn btn-outline" onclick="initClickOrder('${actId}')">↺ Shuffle & Reset</button>
    </div>
    <div class="lab-feedback" id="co-feedback-${actId}" style="display:none"></div>`;
}

function coMove(actId, idx, dir) {
  const st = _coState[actId];
  const arr = st.order;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= arr.length) return;
  [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
  _renderClickOrder(actId);
}

function checkClickOrder(actId) {
  const act = _getActivity(actId);
  const st = _coState[actId];
  const fb = document.getElementById('co-feedback-' + actId);
  const current = st.order;
  const correct = act.answer;
  const allCorrect = current.every((item, i) => item === correct[i]);

  fb.style.display = 'block';
  if (allCorrect) {
    fb.className = 'lab-feedback success';
    fb.textContent = '✅ Correct order! ' + (act.explanation || '');
    document.querySelectorAll(`#co-list-${actId} .co-card`).forEach(c => {
      c.classList.remove('wrong', 'right'); c.classList.add('right');
    });
  } else {
    const correctCount = current.filter((item, i) => item === correct[i]).length;
    fb.className = 'lab-feedback error';
    fb.innerHTML = `❌ ${correctCount}/${correct.length} in the right position. Keep adjusting!<br><em>Hint: ${act.explanation || ''}</em>`;
    document.querySelectorAll(`#co-list-${actId} .co-card`).forEach((card, i) => {
      card.classList.remove('right', 'wrong');
      card.classList.add(current[i] === correct[i] ? 'right' : 'wrong');
    });
  }
}

// ---- Fill-in-the-Blank Engine ----
function initFillBlank(actId) {
  const act = _getActivity(actId);
  if (!act) return;
  const container = document.getElementById('lab-body-' + actId);
  if (!container) return;
  container.innerHTML = `
    <p class="lab-hint">${_escapeHtml(act.instructions || 'Type the missing word in each blank, then check your answers.')}</p>
    <div class="fb-list">
      ${act.questions.map((q, i) => `
        <div class="fb-item" id="fb-item-${actId}-${i}">
          <div class="fb-prompt">${_formatBlankPrompt(q.prompt, actId, i)}</div>
          <div class="fb-hint" id="fb-hint-${actId}-${i}" style="display:none">💡 Hint: starts with "${q.hints ? q.hints[0] : q.answer[0] + '...'}"</div>
        </div>`).join('')}
    </div>
    <div class="lab-actions">
      <button class="btn btn-primary" onclick="checkFillBlank('${actId}')">✓ Check All</button>
      <button class="btn btn-outline" onclick="initFillBlank('${actId}')">↺ Reset</button>
      <button class="btn btn-outline" onclick="showFbHints('${actId}')">💡 Show Hints</button>
    </div>
    <div class="lab-feedback" id="fb-feedback-${actId}" style="display:none"></div>`;
}

function _formatBlankPrompt(prompt, actId, qIdx) {
  return prompt.replace('_____', `<input class="fb-input" type="text" id="fb-ans-${actId}-${qIdx}" placeholder="type answer…" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter')checkFillBlank('${actId}')">`);
}

function checkFillBlank(actId) {
  const act = _getActivity(actId);
  let correct = 0;
  act.questions.forEach((q, i) => {
    const input = document.getElementById(`fb-ans-${actId}-${i}`);
    const item = document.getElementById(`fb-item-${actId}-${i}`);
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    const ans = q.answer.toLowerCase();
    input.classList.remove('right', 'wrong');
    item.classList.remove('fb-correct', 'fb-wrong');
    if (val === ans) {
      input.classList.add('right'); item.classList.add('fb-correct'); correct++;
    } else {
      input.classList.add('wrong'); item.classList.add('fb-wrong');
      const hint = document.getElementById(`fb-hint-${actId}-${i}`);
      if (hint) { hint.style.display = 'block'; hint.textContent = `✓ Answer: ${q.answer}`; }
    }
  });
  const fb = document.getElementById('fb-feedback-' + actId);
  fb.style.display = 'block';
  if (correct === act.questions.length) {
    fb.className = 'lab-feedback success';
    fb.textContent = `✅ All ${correct} correct! Excellent work!`;
  } else {
    fb.className = 'lab-feedback error';
    fb.textContent = `${correct}/${act.questions.length} correct. Incorrect answers shown above.`;
  }
}

function showFbHints(actId) {
  const act = _getActivity(actId);
  act.questions.forEach((q, i) => {
    const hint = document.getElementById(`fb-hint-${actId}-${i}`);
    if (hint && hint.style.display === 'none') {
      hint.style.display = 'block';
      hint.textContent = `💡 Hint: "${q.hints ? q.hints[0] : q.answer.substring(0, 2) + '...'}"`;
    }
  });
}

// ---- Helpers ----
function _slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]/g, '-'); }

function _escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _getActivity(actId) {
  for (const ch in LABS) {
    const found = LABS[ch].activities.find(a => a.id === actId);
    if (found) return found;
  }
  return null;
}

// ---- Lab Section Renderer ----
function renderLabSection(ch) {
  const chData = LABS[ch];
  if (!chData) return;
  const container = document.getElementById('lab-section-' + ch);
  if (!container) return;

  chData.activities.forEach(act => {
    const card = document.getElementById('lab-card-' + act.id);
    if (!card) return;

    // ── Upgrade card to immersive workspace layout (runs once) ─────────────
    if (!card.dataset.wsInit) {
      card.dataset.wsInit = '1';
      _upgradeLabCard(act, card);
    }

    // ── Render exercise body ───────────────────────────────────────────────
    if (act.type === 'click-match')  initClickMatch(act.id);
    else if (act.type === 'click-order') initClickOrder(act.id);
    else if (act.type === 'fill-blank')  initFillBlank(act.id);
    else if (act.type === 'code-lab')    renderCodeLab(act.id);
  });
}

/**
 * Rebuild a lab card's inner HTML to use the immersive workspace layout:
 *   header bar (title + badges)
 *   zones row  (objectives | attempt history)
 *   body       (existing lab-body-* div)
 */
function _upgradeLabCard(act, card) {
  const isGraded   = act.graded === true;
  const typeLbl    = { 'click-match':'Click & Match','click-order':'Click & Order',
                       'fill-blank':'Fill in Blanks','code-lab':'Code Lab' }[act.type] || act.type;
  const typeCss    = { 'click-match':'badge-drag','click-order':'badge-drag',
                       'fill-blank':'badge-fill','code-lab':'badge-code' }[act.type] || 'badge-drag';
  const gradedCss  = isGraded ? 'graded' : 'practice';
  const gradedLbl  = isGraded ? '🏆 Graded' : '🟣 Practice';
  const gradedBadgeCss = isGraded ? 'badge-graded' : 'badge-practice';

  card.classList.add(gradedCss);

  // Objectives (optional field on activity)
  const objs = act.objectives || [];
  const objHtml = objs.length
    ? '<ul class="lab-objective-list">' +
        objs.map((o) => `<li>${_escapeHtml(o)}</li>`).join('') + '</ul>'
    : '<span style="font-size:12px;color:var(--text-muted)">Complete the exercise below.</span>';

  const instr = typeof act.instructions === 'string' ? act.instructions.trim() : '';
  const codeRunHint =
    act.type === 'code-lab'
      ? `<p class="lab-code-runtime-note">Use <strong>▶ Run</strong> to execute the active tab (in-browser Python, or Docker if your environment uses the lab orchestrator). Switch tabs to move between exercises. <strong>↺ Reset</strong> restores starter code. When a notebook is listed for this chapter, download it from the chapter header to do the same work in Jupyter.</p>`
      : '';

  // Attempt history placeholder (populated async by SbLabs if signed in)
  const histHtml = `<div class="lab-attempt-history" id="lab-history-${act.id}">
    <div class="attempt-row" style="font-style:italic">No attempts yet</div>
  </div>`;

  // Grab the existing lab-body div before overwriting innerHTML
  const bodyDiv = card.querySelector('#lab-body-' + act.id) || (() => {
    const d = document.createElement('div');
    d.id = 'lab-body-' + act.id;
    return d;
  })();
  bodyDiv.remove(); // detach before innerHTML wipe

  const instructionsBlock =
    instr || codeRunHint
      ? `<div class="lab-workspace-instructions">
          <div class="lab-zone-label">How to complete this lab</div>
          ${instr ? `<p class="lab-instructions">${_escapeHtml(instr)}</p>` : ''}
          ${codeRunHint}
        </div>`
      : '';

  card.innerHTML = `
    <div class="lab-workspace-header">
      <h3>${act.title || act.id}</h3>
      <div class="lab-workspace-badges">
        <span class="lab-type-badge ${typeCss}">${typeLbl}</span>
        <span class="lab-type-badge ${gradedBadgeCss}">${gradedLbl}</span>
      </div>
    </div>
    ${instructionsBlock}
    <div class="lab-zones">
      <div class="lab-zone">
        <div class="lab-zone-label">🎯 Objectives</div>
        ${objHtml}
      </div>
      <div class="lab-zone">
        <div class="lab-zone-label">📋 Attempt History</div>
        ${histHtml}
      </div>
    </div>
    <div class="lab-workspace-body" id="lab-workspace-body-${act.id}"></div>`;

  // Re-attach body div
  const ws = card.querySelector('#lab-workspace-body-' + act.id);
  if (ws) ws.appendChild(bodyDiv);

  // Async: populate attempt history from SbLabs if the user is signed in
  if (typeof SbLabs !== 'undefined') {
    _loadLabAttemptHistory(act.id);
  }
}

async function _loadLabAttemptHistory(actId) {
  try {
    const histEl = document.getElementById('lab-history-' + actId);
    if (!histEl) return;
    // SbLabs.getAttempts is a lightweight helper we add in db-client.js
    if (typeof SbLabs.getAttempts !== 'function') return;
    const attempts = await SbLabs.getAttempts(actId);
    if (!attempts || !attempts.length) return;
    histEl.innerHTML = attempts.slice(0, 4).map((a, i) => {
      const passed = a.passed ? '<span class="attempt-pass">✓ Pass</span>' : '<span class="attempt-fail">✗ Fail</span>';
      const score  = a.score != null ? ` ${Math.round(a.score)}%` : '';
      const when   = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '';
      return `<div class="attempt-row">#${i+1} ${passed}${score} <span style="margin-left:auto">${when}</span></div>`;
    }).join('');
  } catch {}
}

// ---- Download Notebook ----
function downloadNotebook(ch) {
  const nb = LABS[ch] && LABS[ch].notebook;
  if (!nb) { alert('No notebook available for this chapter yet.'); return; }
  const a = document.createElement('a');
  a.href = nb.filename;
  a.download = nb.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
// ACTIVITY DEFINITIONS
// ============================================================
var LABS = {
  // ---- CHAPTER 1 ----
  ch1: {
    notebook: null,
    activities: [
      {
        type: 'click-order',
        id: 'ch1-lab-order',
        title: '🔢 Put the Analytics Process in Order',
        instructions: 'Use the ↑ ↓ buttons to arrange the five steps in the correct sequence.',
        items: ['Visualization', 'Analysis', 'Data Acquisition', 'Reporting & Communication', 'Cleaning & Manipulation'],
        answer: ['Data Acquisition', 'Cleaning & Manipulation', 'Analysis', 'Visualization', 'Reporting & Communication'],
        explanation: 'Data Acquisition → Cleaning & Manipulation → Analysis → Visualization → Reporting & Communication.'
      },
      {
        type: 'click-match',
        id: 'ch1-lab-match',
        title: '🎯 Match Analytics Types to Scenarios',
        instructions: 'Click a card to select it, then click the correct category zone.',
        categories: ['Descriptive', 'Predictive', 'Prescriptive'],
        items: [
          { text: 'Sales dropped 15% last quarter — why?', category: 'Descriptive' },
          { text: 'Which customers will likely churn next month?', category: 'Predictive' },
          { text: 'How should we allocate our marketing budget?', category: 'Prescriptive' },
          { text: 'What were our top-selling products in 2023?', category: 'Descriptive' },
          { text: 'Which shipping route minimises delivery time?', category: 'Prescriptive' },
          { text: 'Will this loan applicant default on their loan?', category: 'Predictive' }
        ]
      }
    ]
  },

  // ---- CHAPTER 2 ----
  ch2: {
    notebook: { filename: 'ch2_data_types_lab.ipynb', title: 'Ch 2 — Data Types in Python' },
    activities: [
      {
        type: 'click-match',
        id: 'ch2-lab-match',
        title: '🗂️ Classify These Data Examples',
        instructions: 'Click a card to select it, then click the correct category zone.',
        categories: ['Structured', 'Semi-structured', 'Unstructured'],
        items: [
          { text: 'A CSV file of sales transactions', category: 'Structured' },
          { text: 'A JSON API response with user profiles', category: 'Semi-structured' },
          { text: 'Customer review paragraphs in free text', category: 'Unstructured' },
          { text: 'A relational database table of employees', category: 'Structured' },
          { text: 'An XML configuration file', category: 'Semi-structured' },
          { text: 'Security camera video footage', category: 'Unstructured' },
          { text: 'An email message (To/Subject/Body)', category: 'Semi-structured' },
          { text: 'Monthly revenue spreadsheet', category: 'Structured' }
        ]
      },
      {
        type: 'fill-blank',
        id: 'ch2-lab-fill',
        title: '✏️ Fill in the Data Type Definitions',
        instructions: 'Type the correct term for each definition.',
        questions: [
          { prompt: 'Data that can only take countable whole number values (e.g., number of orders) is called _____ data.', answer: 'discrete' },
          { prompt: 'Data that can take any value in a range including decimals (e.g., temperature) is _____ data.', answer: 'continuous' },
          { prompt: 'Text data with a known, finite set of possible values (e.g., product category) is _____ data.', answer: 'categorical' },
          { prompt: 'The character data type that stores both letters AND numbers is called _____.', answer: 'alphanumeric' },
          { prompt: 'Spreadsheets use _____ typing, where data types are loosely enforced ("automatic").', answer: 'weak' },
          { prompt: 'Data organized into fact tables and dimension tables is called _____ data.', answer: 'dimensional' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch2-lab-code',
        title: '🐍 Python: Exploring Data Types',
        instructions: 'Run each cell to explore Python data types. Modify the code to complete the exercises.',
        objectives: [
          'Relate Python built-in types to CompTIA structured, categorical, and numeric ideas.',
          'See why Python blocks implicit string + int and how explicit conversion fixes it.',
          'Classify sample measurements as discrete or continuous.',
        ],
        cells: [
          {
            type: 'markdown',
            content: '<strong>Exercise 1:</strong> Python built-in data types that map to CompTIA data categories.'
          },
          {
            type: 'code',
            code: `# CompTIA Data Types in Python
# Numeric - Integer (whole number / discrete)
order_count = 42
print("order_count =", order_count, "  type =", type(order_count).__name__)

# Numeric - Float (rational / continuous)
temperature = 98.6
print("temperature =", temperature, "  type =", type(temperature).__name__)

# Text / Alphanumeric
customer_id = "CUST-00123"
print("customer_id =", customer_id, "  type =", type(customer_id).__name__)

# Boolean
is_active = True
print("is_active   =", is_active, "  type =", type(is_active).__name__)

# TODO: Add a variable signup_date using a string like "2024-01-15"
# Then print its type
signup_date = "2024-01-15"
print("signup_date =", signup_date, "  type =", type(signup_date).__name__)`
          },
          {
            type: 'markdown',
            content: '<strong>Exercise 2:</strong> Strong vs weak typing in Python.'
          },
          {
            type: 'code',
            code: `# Python requires explicit type conversion (strong-like typing)
value_a = "10"   # string
value_b = 5      # integer

# This will FAIL - Python won't auto-coerce string + int
try:
    result = value_a + value_b
    print(result)
except TypeError as e:
    print("TypeError:", e)
    print("Python requires explicit conversion!")

# Correct approach: explicit conversion
result_correct = int(value_a) + value_b
print("After int() conversion:", value_a, "+", value_b, "=", result_correct)`
          },
          {
            type: 'markdown',
            content: '<strong>Exercise 3:</strong> Discrete vs Continuous — classify the values.'
          },
          {
            type: 'code',
            code: `data = [
    ("dogs_in_shelter",  7),
    ("dog_weight_kg",    14.3),
    ("adoption_fee",     85.00),
    ("num_vaccinations", 3),
    ("temperature_c",    37.2),
]

for field, value in data:
    is_float = isinstance(value, float)
    classification = "continuous" if is_float else "discrete"
    print(field, "->", value, "->", classification)`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 3 ----
  ch3: {
    notebook: { filename: 'ch3_databases_lab.ipynb', title: 'Ch 3 — SQL & Databases' },
    activities: [
      {
        type: 'click-match',
        id: 'ch3-lab-match',
        title: '🗄️ Match Database Concepts',
        instructions: 'Click a card to select it, then click the correct zone.',
        categories: ['OLTP', 'OLAP', 'Data Lake', 'Data Warehouse', 'Data Mart'],
        items: [
          { text: 'Optimised for fast, high-volume read/write transactions (e.g., POS system)', category: 'OLTP' },
          { text: 'Stores raw data in native format — structured AND unstructured', category: 'Data Lake' },
          { text: 'Central repository of cleaned, historical structured data for BI reporting', category: 'Data Warehouse' },
          { text: 'Optimised for complex analytical queries across large historical datasets', category: 'OLAP' },
          { text: 'Subject-specific subset — e.g., a Sales BI database only', category: 'Data Mart' },
          { text: 'Online Banking transaction system inserting millions of rows per day', category: 'OLTP' },
          { text: 'Holds raw IoT sensor data, images, logs until needed', category: 'Data Lake' }
        ]
      },
      {
        type: 'click-order',
        id: 'ch3-lab-etl',
        title: '⚙️ Put the ETL Steps in Order',
        instructions: 'Use ↑ ↓ buttons to arrange the ETL process steps in the correct sequence.',
        items: ['Load data into target system', 'Extract data from source systems', 'Transform: clean, deduplicate, format', 'Validate data quality in target', 'Schedule next ETL run'],
        answer: ['Extract data from source systems', 'Transform: clean, deduplicate, format', 'Load data into target system', 'Validate data quality in target', 'Schedule next ETL run'],
        explanation: 'ETL = Extract → Transform → Load. After loading, validate quality and schedule the next run.'
      },
      {
        type: 'code-lab',
        id: 'ch3-lab-code',
        title: '🐍 Python + SQLite: Databases & SQL',
        instructions: 'Build a small database, write SQL queries, and simulate an ETL pipeline.',
        objectives: [
          'Model relational tables and WHERE / ORDER BY style queries with Python lists of dicts.',
          'Recreate INNER JOIN and GROUP BY using lookups and aggregation loops.',
          'Run a small Extract → Transform → Load flow on messy source rows.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> Create relational tables and query them — SQL concepts in pure Python.' },
          {
            type: 'code',
            code: `# ==== Relational Database concepts in Python ====
# SQL: CREATE TABLE  ->  Python: list of dicts
customers = [
    {'customer_id': 1, 'name': 'Alice Johnson', 'email': 'alice@example.com'},
    {'customer_id': 2, 'name': 'Bob Smith',     'email': 'bob@example.com'},
    {'customer_id': 3, 'name': 'Carol White',   'email': 'carol@example.com'},
]
orders = [
    {'order_id': 101, 'customer_id': 1, 'product': 'Laptop',   'amount': 1200.00, 'order_date': '2024-01-10'},
    {'order_id': 102, 'customer_id': 1, 'product': 'Mouse',    'amount':   25.00, 'order_date': '2024-01-12'},
    {'order_id': 103, 'customer_id': 2, 'product': 'Keyboard', 'amount':   75.00, 'order_date': '2024-01-15'},
    {'order_id': 104, 'customer_id': 3, 'product': 'Monitor',  'amount':  350.00, 'order_date': '2024-01-18'},
    {'order_id': 105, 'customer_id': 2, 'product': 'Laptop',   'amount': 1200.00, 'order_date': '2024-02-01'},
]

# SQL: SELECT COUNT(*)
print("=== Table Sizes (SELECT COUNT(*)) ===")
print("Customers:", len(customers))
print("Orders:   ", len(orders))

# SQL: SELECT * FROM orders WHERE amount > 100
print()
print("=== High-Value Orders (WHERE amount > 100) ===")
for o in [o for o in orders if o['amount'] > 100]:
    print("  Order %d: %-12s  $%.2f" % (o['order_id'], o['product'], o['amount']))

# SQL: SELECT * FROM orders ORDER BY amount DESC LIMIT 3
print()
print("=== Top 3 Orders by Value (ORDER BY amount DESC) ===")
for o in sorted(orders, key=lambda x: x['amount'], reverse=True)[:3]:
    print("  #%d  %-12s  $%.2f" % (o['order_id'], o['product'], o['amount']))`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> INNER JOIN and GROUP BY — Python equivalents.' },
          {
            type: 'code',
            code: `# Re-define tables (each cell is self-contained)
customers = [
    {'customer_id': 1, 'name': 'Alice Johnson'},
    {'customer_id': 2, 'name': 'Bob Smith'},
    {'customer_id': 3, 'name': 'Carol White'},
]
orders = [
    {'order_id': 101, 'customer_id': 1, 'product': 'Laptop',   'amount': 1200.00},
    {'order_id': 102, 'customer_id': 1, 'product': 'Mouse',    'amount':   25.00},
    {'order_id': 103, 'customer_id': 2, 'product': 'Keyboard', 'amount':   75.00},
    {'order_id': 104, 'customer_id': 3, 'product': 'Monitor',  'amount':  350.00},
    {'order_id': 105, 'customer_id': 2, 'product': 'Laptop',   'amount': 1200.00},
]

# SQL: INNER JOIN customers ON customer_id
print("=== INNER JOIN: Customer + Orders ===")
cust_map = {c['customer_id']: c['name'] for c in customers}
joined = sorted(
    [{'name': cust_map[o['customer_id']], 'product': o['product'], 'amount': o['amount']}
     for o in orders if o['customer_id'] in cust_map],
    key=lambda r: r['name']
)
for r in joined:
    print("  %-16s %-12s  $%.2f" % (r['name'], r['product'], r['amount']))

# SQL: GROUP BY customer_id with COUNT and SUM
print()
print("=== GROUP BY: Spend per Customer ===")
totals = {}
for o in orders:
    cid = o['customer_id']
    if cid not in totals:
        totals[cid] = {'name': cust_map.get(cid, '?'), 'count': 0, 'total': 0.0}
    totals[cid]['count'] += 1
    totals[cid]['total'] += o['amount']

for cid, row in sorted(totals.items(), key=lambda x: -x[1]['total']):
    print("  %-16s  orders=%d  total=$%.2f" % (row['name'], row['count'], row['total']))`
          },
          { type: 'markdown', content: '<strong>Exercise 3:</strong> Simulate an ETL pipeline (Extract, Transform, Load).' },
          {
            type: 'code',
            code: `# EXTRACT: raw source data
raw_data = [
    {'id': 201, 'cust': 'dave@example.com', 'amt': '$500', 'date': '2024-03-01'},
    {'id': 202, 'cust': 'ALICE@EXAMPLE.COM', 'amt': '$75 ', 'date': '2024-03-02'},
    {'id': 203, 'cust': 'unknown',           'amt': 'N/A', 'date': '2024-03-03'},
]

# TRANSFORM: clean and standardise
def transform(record):
    email = record['cust'].lower().strip()
    try:
        amount = float(record['amt'].replace('$','').replace(' ',''))
    except:
        amount = None
    return {'order_id': record['id'], 'email': email, 'amount': amount, 'date': record['date']}

cleaned = [transform(r) for r in raw_data]
valid   = [r for r in cleaned if r['amount'] is not None]
invalid = [r for r in cleaned if r['amount'] is None]

print("Extracted:", len(raw_data), "records")
print("Valid after transform:", len(valid))
print("Invalid (skipped):", len(invalid))

# LOAD
for r in valid:
    print("  Loading order", r['order_id'], ":", r['email'], "- $" + str(r['amount']))`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 4 ----
  ch4: {
    notebook: { filename: 'ch4_data_quality_lab.ipynb', title: 'Ch 4 — Data Quality & Cleaning' },
    activities: [
      {
        type: 'fill-blank',
        id: 'ch4-lab-fill',
        title: '✏️ Data Quality Dimensions',
        instructions: 'Fill in the correct quality dimension for each description.',
        questions: [
          { prompt: 'All required fields are present with no missing values: data _____.', answer: 'completeness' },
          { prompt: 'Values match the real-world fact they represent: data _____.', answer: 'accuracy' },
          { prompt: 'The same data element has the same value across all systems: data _____.', answer: 'consistency' },
          { prompt: 'Data is available when needed and reflects the current state: data _____.', answer: 'timeliness' },
          { prompt: 'No duplicate records exist in the dataset: data _____.', answer: 'uniqueness' },
          { prompt: 'Values fall within the acceptable, expected range for their field: data _____.', answer: 'validity' }
        ]
      },
      {
        type: 'click-match',
        id: 'ch4-lab-match',
        title: '🧹 Match Data Issues to Fixes',
        instructions: 'Click a card to select it, then click the correct remediation zone.',
        categories: ['Imputation', 'Deduplication', 'Normalization', 'Recoding', 'Filtering/Removal'],
        items: [
          { text: 'Column "Age" has NaN for 8% of rows', category: 'Imputation' },
          { text: 'Same customer appears 3 times with same email', category: 'Deduplication' },
          { text: '"Income" ranges from 20K–500K, skewing ML model', category: 'Normalization' },
          { text: '"Gender" stored as M/F/Male/Female/male', category: 'Recoding' },
          { text: '"OrderDate" = "ABC" — clearly invalid entry', category: 'Filtering/Removal' },
          { text: '"Score" has 3 missing values out of 1,000', category: 'Imputation' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch4-lab-code',
        title: '🐍 Python: Data Cleaning Pipeline',
        instructions: 'Work through a full data cleaning workflow using built-in Python.',
        objectives: [
          'Profile a dataset for missing values, duplicates, and invalid entries.',
          'Impute, deduplicate, and remove outliers with plain Python.',
          'Apply min–max normalization to a numeric column.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> Detect missing values, duplicates, and outliers.' },
          {
            type: 'code',
            code: `data = [
    {'id': 1, 'name': 'Alice',  'age': 28,   'salary': 55000, 'dept': 'Sales'},
    {'id': 2, 'name': 'Bob',    'age': None,  'salary': 62000, 'dept': 'IT'},
    {'id': 3, 'name': 'Carol',  'age': 34,   'salary': None,  'dept': 'Sales'},
    {'id': 4, 'name': 'Dave',   'age': 45,   'salary': 71000, 'dept': 'HR'},
    {'id': 5, 'name': 'Bob',    'age': None,  'salary': 62000, 'dept': 'IT'},
    {'id': 6, 'name': 'Eve',    'age': 29,   'salary': 58000, 'dept': 'Sales'},
    {'id': 7, 'name': 'Frank',  'age': 150,  'salary': 49000, 'dept': 'IT'},
    {'id': 8, 'name': 'Grace',  'age': 31,   'salary': 53000, 'dept': None},
]

fields = ['age', 'salary', 'dept']
for field in fields:
    missing = sum(1 for r in data if r[field] is None)
    print("Missing '" + field + "': " + str(missing) + "/" + str(len(data)))`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> Imputation, deduplication, and outlier removal.' },
          {
            type: 'code',
            code: `ages = [r['age'] for r in data if r['age'] is not None and r['age'] < 100]
mean_age = sum(ages) / len(ages)
for r in data:
    if r['age'] is None:
        r['age'] = round(mean_age, 1)

print("Mean age used for imputation:", round(mean_age, 1))

data = [r for r in data if r['age'] <= 100]

seen = set()
unique_data = []
for r in data:
    key = (r['name'], r['salary'])
    if key not in seen:
        seen.add(key)
        unique_data.append(r)

print("Records after dedup:", len(unique_data), "(was", len(data), ")")
for r in unique_data:
    print(r)`
          },
          { type: 'markdown', content: '<strong>Exercise 3:</strong> Min-max normalization of salary.' },
          {
            type: 'code',
            code: `salaries = [r['salary'] for r in unique_data if r['salary'] is not None]
s_min = min(salaries)
s_max = max(salaries)

for r in unique_data:
    if r['salary'] is not None:
        r['salary_norm'] = round((r['salary'] - s_min) / (s_max - s_min), 3)

print("=== Normalized Salaries ===")
for r in unique_data:
    print(r['name'], "| salary =", r['salary'], "| normalized =", r.get('salary_norm', 'N/A'))`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 5 ----
  ch5: {
    notebook: { filename: 'ch5_statistics_lab.ipynb', title: 'Ch 5 — Statistics in Python' },
    activities: [
      {
        type: 'fill-blank',
        id: 'ch5-lab-fill',
        title: '✏️ Statistics Formulas & Concepts',
        instructions: 'Fill in the key statistical term for each description.',
        questions: [
          { prompt: 'The sum of all values divided by the count is the _____.', answer: 'mean' },
          { prompt: 'The middle value when data is sorted in order is the _____.', answer: 'median' },
          { prompt: 'The square root of the variance is the _____ _____.', answer: 'standard deviation' },
          { prompt: 'In a normal distribution, 95% of values fall within _____ standard deviations of the mean.', answer: '2' },
          { prompt: 'The probability of observing data at least as extreme, assuming H0 is true, is the _____.', answer: 'p-value' },
          { prompt: 'Rejecting a true null hypothesis is called a Type _____ error.', answer: 'I' },
          { prompt: 'A measure from -1 to +1 quantifying the linear relationship between two variables is the _____ coefficient.', answer: 'correlation' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch5-lab-code',
        title: '🐍 Python: Statistics from Scratch',
        instructions: 'Calculate core statistics using pure Python — no libraries needed.',
        objectives: [
          'Compute mean, median, mode, variance, and standard deviation by hand in code.',
          'Flag potential outliers using z-scores.',
          'Calculate Pearson correlation between two paired lists.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> Measures of central tendency and dispersion.' },
          {
            type: 'code',
            code: `import math

scores = [72, 85, 90, 68, 92, 88, 76, 95, 81, 70, 84, 91, 67, 89, 78]
n = len(scores)

mean = sum(scores) / n
sorted_scores = sorted(scores)
mid = n // 2
median = sorted_scores[mid] if n % 2 != 0 else (sorted_scores[mid-1] + sorted_scores[mid]) / 2

# Mode: most frequent value
freq = {}
for x in scores:
    freq[x] = freq.get(x, 0) + 1
mode = max(freq, key=lambda k: freq[k])

variance = sum((x - mean)**2 for x in scores) / n
std_dev  = math.sqrt(variance)

print("n       =", n)
print("Mean    =", round(mean, 2))
print("Median  =", median)
print("Mode    =", mode)
print("Range   =", max(scores) - min(scores))
print("Variance=", round(variance, 2))
print("Std Dev =", round(std_dev, 2))
print()
within_1 = sum(1 for x in scores if abs(x - mean) <= std_dev)
within_2 = sum(1 for x in scores if abs(x - mean) <= 2*std_dev)
print("Within 1 SD:", within_1, "/", n, "=", round(within_1/n*100, 1), "% (expect ~68%)")
print("Within 2 SD:", within_2, "/", n, "=", round(within_2/n*100, 1), "% (expect ~95%)")`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> Z-scores and outlier detection.' },
          {
            type: 'code',
            code: `# Z-score = (value - mean) / std_dev
# Values with |z| > 2 are potential outliers

z_scores = [(x, round((x - mean) / std_dev, 2)) for x in scores]
print("=== Z-Scores (sorted by distance from mean) ===")
for val, z in sorted(z_scores, key=lambda x: abs(x[1]), reverse=True):
    flag = " <- outlier?" if abs(z) > 2 else ""
    print("  score =", val, "  z =", z, flag)`
          },
          { type: 'markdown', content: '<strong>Exercise 3:</strong> Pearson correlation coefficient.' },
          {
            type: 'code',
            code: `study_hours = [2, 3, 5, 4, 6, 7, 1, 8, 5, 4, 9, 3, 6, 7, 2]
exam_scores = [65, 70, 82, 75, 88, 91, 58, 95, 80, 72, 97, 68, 85, 90, 62]

n2 = len(study_hours)
mean_x = sum(study_hours) / n2
mean_y = sum(exam_scores) / n2

numerator = sum((study_hours[i] - mean_x)*(exam_scores[i] - mean_y) for i in range(n2))
denom_x   = math.sqrt(sum((x - mean_x)**2 for x in study_hours))
denom_y   = math.sqrt(sum((y - mean_y)**2 for y in exam_scores))

r = numerator / (denom_x * denom_y)
print("Correlation r =", round(r, 4))
if r > 0.7:
    print("Strong POSITIVE correlation: more study hours -> higher scores")
elif r > 0.3:
    print("Moderate positive correlation")
else:
    print("Weak or no linear correlation")`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 6 ----
  ch6: {
    notebook: { filename: 'ch6_tools_lab.ipynb', title: 'Ch 6 — Analytics Tools' },
    activities: [
      {
        type: 'click-match',
        id: 'ch6-lab-match',
        title: '🛠️ Match Tools to Their Primary Use Case',
        instructions: 'Click a card to select it, then click the correct category zone.',
        categories: ['Python Ecosystem', 'R Ecosystem', 'BI & Dashboards', 'Statistical Analysis', 'Machine Learning Platform'],
        items: [
          { text: 'pandas — DataFrame manipulation library', category: 'Python Ecosystem' },
          { text: 'ggplot2 — grammar-of-graphics visualisation', category: 'R Ecosystem' },
          { text: 'Tableau — drag-and-drop visual analytics', category: 'BI & Dashboards' },
          { text: 'IBM SPSS — advanced statistical modelling', category: 'Statistical Analysis' },
          { text: 'RapidMiner — visual ML workflow builder', category: 'Machine Learning Platform' },
          { text: 'Power BI — Microsoft BI & reporting suite', category: 'BI & Dashboards' },
          { text: 'scikit-learn — ML algorithms for Python', category: 'Python Ecosystem' },
          { text: 'SAS — enterprise analytics and statistics', category: 'Statistical Analysis' },
          { text: 'tidyverse — data science package collection', category: 'R Ecosystem' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch6-lab-code',
        title: '🐍 Python Analytics Pipeline',
        instructions: 'Run a mini end-to-end analytics pipeline using Python builtins.',
        objectives: [
          'Summarize numeric fields the way describe()-style reports do.',
          'Group records and compute aggregates (counts, sums) by key.',
          'Turn raw rows into simple ranked or segmented insights.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> Data summary — what pandas.describe() does under the hood.' },
          {
            type: 'code',
            code: `import math

sales = [
    {'region': 'North', 'product': 'Laptop',   'qty': 12, 'revenue': 14400},
    {'region': 'South', 'product': 'Mouse',     'qty': 45, 'revenue':  1125},
    {'region': 'North', 'product': 'Monitor',   'qty':  8, 'revenue':  2800},
    {'region': 'East',  'product': 'Laptop',    'qty': 20, 'revenue': 24000},
    {'region': 'West',  'product': 'Keyboard',  'qty': 30, 'revenue':  2100},
    {'region': 'South', 'product': 'Laptop',    'qty': 15, 'revenue': 18000},
    {'region': 'East',  'product': 'Mouse',     'qty': 60, 'revenue':  1500},
    {'region': 'North', 'product': 'Monitor',   'qty': 10, 'revenue':  3500},
]

revenues = [r['revenue'] for r in sales]
print("=== Revenue Summary ===")
print("Count  :", len(revenues))
print("Sum    : $" + str(sum(revenues)))
print("Mean   : $" + str(round(sum(revenues)/len(revenues), 2)))
print("Min    : $" + str(min(revenues)))
print("Max    : $" + str(max(revenues)))
sorted_rev = sorted(revenues)
print("Median : $" + str(sorted_rev[len(sorted_rev)//2]))`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> GROUP BY — Python equivalent of SQL GROUP BY.' },
          {
            type: 'code',
            code: `# Group by region
by_region = {}
for r in sales:
    reg = r['region']
    if reg not in by_region:
        by_region[reg] = {'total_rev': 0, 'total_qty': 0, 'count': 0}
    by_region[reg]['total_rev'] += r['revenue']
    by_region[reg]['total_qty'] += r['qty']
    by_region[reg]['count'] += 1

print("=== Sales by Region ===")
for region in sorted(by_region):
    m = by_region[region]
    print(region, "| Orders:", m['count'], "| Qty:", m['total_qty'], "| Revenue: $" + str(m['total_rev']))`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 7 ----
  ch7: {
    notebook: { filename: 'ch7_visualization_lab.ipynb', title: 'Ch 7 — Data Visualization' },
    activities: [
      {
        type: 'click-match',
        id: 'ch7-lab-match',
        title: '📊 Pick the Right Chart',
        instructions: 'Click a card to select it, then click the correct chart type zone.',
        categories: ['Line Chart', 'Bar Chart', 'Scatter Plot', 'Pie Chart', 'Histogram', 'Heat Map', 'Waterfall Chart', 'Box Plot'],
        items: [
          { text: 'Monthly website traffic over 2 years', category: 'Line Chart' },
          { text: 'Revenue breakdown by product category', category: 'Bar Chart' },
          { text: 'Relationship between advertising spend and sales', category: 'Scatter Plot' },
          { text: 'Market share of top 4 competitors (totals 100%)', category: 'Pie Chart' },
          { text: 'Distribution of customer age across the dataset', category: 'Histogram' },
          { text: 'Which cells in a correlation matrix are most related', category: 'Heat Map' },
          { text: 'How gross profit becomes net profit step-by-step', category: 'Waterfall Chart' },
          { text: 'Comparing score distributions across 3 student groups', category: 'Box Plot' }
        ]
      },
      {
        type: 'fill-blank',
        id: 'ch7-lab-fill',
        title: '✏️ Dashboard & Report Vocabulary',
        instructions: 'Fill in the correct term for each visualization concept.',
        questions: [
          { prompt: 'A visual blueprint of a dashboard layout created before development is called a _____ or mockup.', answer: 'wireframe' },
          { prompt: 'Clicking from annual totals down to monthly data is called _____ down.', answer: 'drill' },
          { prompt: 'A report created on-demand to answer a specific one-time question is an _____ report.', answer: 'ad hoc' },
          { prompt: 'A real-time, interactive display of key metrics for at-a-glance monitoring is called a _____.', answer: 'dashboard' },
          { prompt: 'The process of delivering a report to subscribers automatically on a schedule is called _____.', answer: 'subscription' },
          { prompt: 'Reports generated on a fixed schedule (daily, weekly) are called _____ reports.', answer: 'recurring' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch7-lab-code',
        title: '🐍 Python: Chart Logic Without Libraries',
        instructions: 'Understand chart construction logic using plain Python text output.',
        objectives: [
          'Build an ASCII bar chart and relate bar length to scaled numeric values.',
          'Map (x, y) pairs onto a text grid like a scatter plot.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> ASCII bar chart — understand what BI tools do under the hood.' },
          {
            type: 'code',
            code: `data = {
    'Q1 2024': 125000,
    'Q2 2024': 148000,
    'Q3 2024': 132000,
    'Q4 2024': 198000,
}

max_val  = max(data.values())
bar_width = 40

print("=== Quarterly Revenue ===")
print()
for label, value in data.items():
    bar_len = int((value / max_val) * bar_width)
    bar = '#' * bar_len
    print(label, "|", bar.ljust(bar_width), "$" + str(value))`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> ASCII scatter plot — understanding coordinate mapping.' },
          {
            type: 'code',
            code: `ad_spend = [10, 20, 15, 30, 25, 40, 35, 50, 45, 60]
revenue  = [50, 90, 70, 130, 110, 180, 160, 210, 195, 260]

width, height = 40, 12
x_min, x_max = min(ad_spend), max(ad_spend)
y_min, y_max = min(revenue),  max(revenue)

grid = [[' '] * width for _ in range(height)]
for x, y in zip(ad_spend, revenue):
    col = int((x - x_min) / (x_max - x_min) * (width - 1))
    row = height - 1 - int((y - y_min) / (y_max - y_min) * (height - 1))
    grid[row][col] = 'o'

print("Revenue ^")
for i, row in enumerate(grid):
    y_label = int(y_max - (i / (height-1)) * (y_max - y_min))
    print(str(y_label).rjust(5), "|" + "".join(row))
print("      +" + "-"*width)
print("      Ad Spend ->")`
          }
        ]
      }
    ]
  },

  // ---- CHAPTER 8 ----
  ch8: {
    notebook: { filename: 'ch8_governance_lab.ipynb', title: 'Ch 8 — Data Governance' },
    activities: [
      {
        type: 'click-match',
        id: 'ch8-lab-match',
        title: '🔒 Governance Roles & Responsibilities',
        instructions: 'Click a card to select it, then click the correct governance role zone.',
        categories: ['Data Steward', 'Data Owner', 'Data Custodian', 'Compliance Officer'],
        items: [
          { text: 'Leads data quality, privacy, and regulatory compliance initiatives', category: 'Data Steward' },
          { text: 'Accountable for who can access a dataset and how it may be used', category: 'Data Owner' },
          { text: 'Manages the physical storage, backups, and security of data systems', category: 'Data Custodian' },
          { text: 'Ensures the organisation meets GDPR, HIPAA, and other regulations', category: 'Compliance Officer' },
          { text: 'Approves release of a sensitive dataset to an external partner', category: 'Data Owner' },
          { text: 'Defines and enforces data quality standards and business rules', category: 'Data Steward' }
        ]
      },
      {
        type: 'fill-blank',
        id: 'ch8-lab-fill',
        title: '✏️ Data Governance Vocabulary',
        instructions: 'Fill in the correct governance term.',
        questions: [
          { prompt: 'Any data that could identify a specific individual (name, SSN, email) is called _____.', answer: 'PII' },
          { prompt: 'Replacing real PII with realistic fictitious values for dev/test use is called data _____.', answer: 'masking' },
          { prompt: 'Assigning access permissions to roles rather than individual users is called _____ access control.', answer: 'role-based' },
          { prompt: 'The process of creating a single authoritative "golden record" for key business entities is _____.', answer: 'MDM' },
          { prompt: 'The EU regulation that governs personal data collection and processing is _____.', answer: 'GDPR' },
          { prompt: 'Data sensitivity levels from least to most sensitive: Public - Internal - Confidential - _____.', answer: 'Restricted' }
        ]
      },
      {
        type: 'code-lab',
        id: 'ch8-lab-code',
        title: '🐍 Python: Governance in Practice',
        instructions: 'Simulate PII detection, data masking, and a governance audit.',
        objectives: [
          'Detect likely PII fields using pattern checks on sample records.',
          'Mask names, emails, and SSN fragments for safer non-production use.',
          'Run a simple completeness and validity audit with rule checks.',
        ],
        cells: [
          { type: 'markdown', content: '<strong>Exercise 1:</strong> Detect PII fields in a dataset.' },
          {
            type: 'code',
            code: `import re

employees = [
    {'emp_id': 'E001', 'name': 'Alice Johnson', 'email': 'alice.j@company.com',
     'ssn': '123-45-6789', 'dept': 'Engineering', 'salary': 85000},
    {'emp_id': 'E002', 'name': 'Bob Smith',     'email': 'bob.s@company.com',
     'ssn': '987-65-4321', 'dept': 'Marketing',   'salary': 72000},
]

PII_PATTERNS = {
    'email': r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    'ssn':   r'\d{3}-\d{2}-\d{4}',
    'name':  r'^[A-Z][a-z]+ [A-Z][a-z]+$',
}

print("=== PII Field Detection ===")
sample = employees[0]
for field, value in sample.items():
    detected = []
    for pii_type, pattern in PII_PATTERNS.items():
        if re.match(pattern, str(value)):
            detected.append(pii_type)
    status = 'PII: ' + ', '.join(detected) if detected else 'Safe'
    print(field.ljust(12), ":", str(value).ljust(30), status)`
          },
          { type: 'markdown', content: '<strong>Exercise 2:</strong> Apply data masking to protect PII.' },
          {
            type: 'code',
            code: `def mask_name(name):
    parts = name.split()
    return parts[0][0] + '***' + ' ' + parts[-1][0] + '***'

def mask_email(email):
    local, domain = email.split('@')
    return local[0] + '***@' + domain

def mask_ssn(ssn):
    return 'XXX-XX-' + ssn[-4:]

def mask_record(record):
    masked = dict(record)
    if 'name'  in masked: masked['name']  = mask_name(masked['name'])
    if 'email' in masked: masked['email'] = mask_email(masked['email'])
    if 'ssn'   in masked: masked['ssn']   = mask_ssn(masked['ssn'])
    return masked

print("=== Before Masking ===")
for emp in employees:
    print(emp)

print()
print("=== After Masking (safe for dev/test) ===")
for emp in employees:
    print(mask_record(emp))`
          },
          { type: 'markdown', content: '<strong>Exercise 3:</strong> Data governance audit — completeness and validity.' },
          {
            type: 'code',
            code: `def audit_dataset(records, rules):
    total = len(records)
    report = {}
    for field, validator in rules.items():
        missing = sum(1 for r in records if r.get(field) is None or r.get(field) == '')
        invalid = sum(1 for r in records if r.get(field) is not None and not validator(r[field]))
        values  = [r.get(field) for r in records if r.get(field) is not None]
        unique  = len(set(str(v) for v in values))
        report[field] = {
            'total': total,
            'missing': missing,
            'invalid': invalid,
            'unique_values': unique,
            'completeness': str(round((total-missing)/total*100, 1)) + '%'
        }
    return report

rules = {
    'emp_id': lambda v: bool(re.match(r'^E\d{3}$', str(v))),
    'email':  lambda v: bool(re.match(r'.+@.+\..+', str(v))),
    'salary': lambda v: isinstance(v, (int, float)) and 20000 <= v <= 500000,
    'dept':   lambda v: v in ['Engineering','Marketing','Finance','HR','Sales'],
}

audit = audit_dataset(employees, rules)
print("=== Data Governance Audit Report ===")
for field, metrics in audit.items():
    print()
    print("  Field:", field)
    for k, v in metrics.items():
        print("   ", k.ljust(20), ":", v)`
          }
        ]
      }
    ]
  }
};
