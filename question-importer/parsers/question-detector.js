'use strict';

/**
 * question-detector.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts a flat block of text (from a PDF, DOCX, or OCR pass) into a
 * structured array of question objects.
 *
 * Handles:
 *   • Question-number patterns:  1.  /  Q1  /  Question 1  /  (1)
 *   • Option patterns:  A.  /  B)  /  (C)  /  a.  (case-insensitive)
 *   • Inline answer keys:  Answer: A  /  Correct Answer: A, C  /  Ans: B
 *   • Trailing answer-key sections (e.g. "Answers: 1.A  2.C  3.B …")
 *   • Explanation / rationale blocks:  Explanation:  /  Rationale:  /  Discussion:
 *   • Multi-select detection (multiple correct answers)
 *   • True/False questions
 *   • Confidence scoring (0.0 – 1.0) based on fields successfully extracted
 *
 * Output shape per question:
 * {
 *   questionNumber : number | null,
 *   stem           : string,
 *   options        : [{ key: 'A', text: '…' }, …],
 *   correctAnswers : ['A'] | ['A','C'],   // empty array if not found
 *   explanation    : string | null,
 *   questionType   : 'single' | 'multi' | 'true_false',
 *   confidence     : number,              // 0.0 – 1.0
 *   rawText        : string,              // original block of text for audit
 * }
 */

// ── Regular expressions ───────────────────────────────────────────────────────

// Matches a line that starts a new question.
// Groups: [1] optional Q/Question prefix, [2] number
const RE_Q_START = /^(?:(?:question|q)\s*)?(\d{1,3})[.)]\s+\S/i;

// Strict start — used only for boundary splitting (needs the full line context)
const RE_Q_BOUNDARY = /^(?:(?:question|q)\s*)?(\d{1,3})[.)]\s+/i;

// Answer option lines: A. / B) / (C) / a. / A: — captures key + rest of line
const RE_OPTION = /^[\(\[]?([a-eA-E])[\)\].:\s]\s*(.+)/;

// Inline answer key on its own line (or after the options block)
// e.g. "Answer: A"  "Correct Answer: A, C"  "Ans: B"  "ANSWER: A and C"
const RE_ANSWER_LINE = /^(?:correct\s+)?ans(?:wer)?s?\s*[:\-]\s*([A-Ea-e](?:\s*[,\/\s&and]+\s*[A-Ea-e])*)\s*$/i;

// Explanation trigger words
const RE_EXPLANATION = /^(?:explanation|rationale|discussion|note|solution)\s*[:\-]/i;

// True/False question detection
const RE_TF_OPTION = /^[\(\[]?([Tt]rue|[Ff]alse|[TtFf])[\)\].:\s]/;

// Answer-key page/section header: "Answer Key" / "Answers" / "Key:"
const RE_ANSKEY_SECTION = /^(?:answer\s+key|answers?|key)\s*[:\-]?\s*$/i;

// Entry in a trailing answer-key section:  "1. A"  "1) A,C"  "Q1: B"
const RE_ANSKEY_ENTRY = /^(?:(?:question|q)\s*)?(\d{1,3})[.):\s]+([A-Ea-e](?:\s*[,\/&and\s]+[A-Ea-e])*)/i;


// ── Public API ────────────────────────────────────────────────────────────────

/**
 * detectQuestions(text, options?)
 *
 * @param {string} text       - Raw text from PDF/DOCX/OCR
 * @param {object} [opts]
 * @param {string} [opts.parsingMode='auto']  - 'auto' | 'multiple_choice' | 'multi_select' | 'true_false' | 'mixed'
 * @returns {{ questions: Question[], answerKeyMap: Record<number,string[]>, stats: object }}
 */
function detectQuestions(text, opts = {}) {
  const { parsingMode = 'auto' } = opts;

  // ── 1. Normalise line endings; collapse blank lines to single blank
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  // ── 2. Detect and strip any trailing answer-key section
  const { bodyLines, answerKeyMap } = extractAnswerKeySection(lines);

  // ── 3. Split body into per-question blocks
  const blocks = splitIntoBlocks(bodyLines);

  // ── 4. Parse each block into a question object
  const questions = blocks.map((block, idx) =>
    parseBlock(block, idx, answerKeyMap, parsingMode)
  );

  // ── 5. Stats
  const stats = buildStats(questions);

  return { questions, answerKeyMap, stats };
}

module.exports = { detectQuestions };


// ── Step 2: extract trailing answer-key section ───────────────────────────────

function extractAnswerKeySection(lines) {
  const answerKeyMap = {}; // { questionNumber: ['A'] | ['A','C'] }

  // Find the last occurrence of an answer-key section header
  let keyStart = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (RE_ANSKEY_SECTION.test(lines[i].trim())) {
      keyStart = i;
      break;
    }
  }

  if (keyStart === -1) {
    return { bodyLines: lines, answerKeyMap };
  }

  // Parse entries below the header
  for (let i = keyStart + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    const m = RE_ANSKEY_ENTRY.exec(trimmed);
    if (m) {
      const num = parseInt(m[1], 10);
      answerKeyMap[num] = parseAnswerList(m[2]);
    }
  }

  return { bodyLines: lines.slice(0, keyStart), answerKeyMap };
}


// ── Step 3: split body into blocks ───────────────────────────────────────────

function splitIntoBlocks(lines) {
  const blocks = [];
  let current = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (RE_Q_BOUNDARY.test(trimmed) && current.length > 0) {
      // New question starts — flush the current block
      const block = current.join('\n').trim();
      if (block) blocks.push(block);
      current = [trimmed];
    } else {
      if (trimmed || current.length > 0) {
        current.push(trimmed);
      }
    }
  }

  // Flush the last block
  if (current.length > 0) {
    const block = current.join('\n').trim();
    if (block) blocks.push(block);
  }

  // If nothing was split (no numbered questions detected), treat entire text as one block
  if (blocks.length === 0 && lines.some(l => l.trim())) {
    blocks.push(lines.join('\n').trim());
  }

  return blocks;
}


// ── Step 4: parse a single question block ────────────────────────────────────

function parseBlock(rawBlock, blockIndex, answerKeyMap, parsingMode) {
  const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);

  let questionNumber = null;
  const stemLines = [];
  const options = [];
  let correctAnswers = [];
  let explanation = null;
  let inExplanation = false;
  const explanationLines = [];

  // Parse first line for question number
  let lineStart = 0;
  if (lines.length > 0) {
    const m = RE_Q_BOUNDARY.exec(lines[0]);
    if (m) {
      questionNumber = parseInt(m[1], 10);
      // Strip the number prefix from the first line and treat rest as stem
      const stemPart = lines[0].replace(RE_Q_BOUNDARY, '').trim();
      if (stemPart) stemLines.push(stemPart);
      lineStart = 1;
    }
  }

  // Process remaining lines
  for (let i = lineStart; i < lines.length; i++) {
    const line = lines[i];

    // Explanation trigger
    if (RE_EXPLANATION.test(line)) {
      inExplanation = true;
      const expPart = line.replace(RE_EXPLANATION, '').trim();
      if (expPart) explanationLines.push(expPart);
      continue;
    }

    if (inExplanation) {
      explanationLines.push(line);
      continue;
    }

    // Answer line (e.g. "Answer: A")
    const ansMatch = RE_ANSWER_LINE.exec(line);
    if (ansMatch) {
      correctAnswers = parseAnswerList(ansMatch[1]);
      continue;
    }

    // Option line (e.g. "A. Some option text")
    const optMatch = RE_OPTION.exec(line);
    if (optMatch) {
      options.push({ key: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
      continue;
    }

    // Everything else before options → part of the stem
    if (options.length === 0) {
      stemLines.push(line);
    } else {
      // After options started but doesn't match option pattern —
      // might be a continuation of the last option or a stray line
      if (options.length > 0) {
        options[options.length - 1].text += ' ' + line;
      }
    }
  }

  if (explanationLines.length > 0) {
    explanation = explanationLines.join(' ').trim();
  }

  // Merge answer from answerKeyMap if not found inline
  if (correctAnswers.length === 0 && questionNumber !== null && answerKeyMap[questionNumber]) {
    correctAnswers = answerKeyMap[questionNumber];
  }

  const stem = stemLines.join(' ').trim();

  // Detect question type
  const questionType = detectQuestionType(options, correctAnswers, parsingMode);

  // Score confidence
  const confidence = scoreConfidence({ stem, options, correctAnswers, explanation });

  return {
    questionNumber,
    stem,
    options,
    correctAnswers,
    explanation,
    questionType,
    confidence,
    rawText: rawBlock,
  };
}


// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a raw answer string like "A", "A, C", "A and C", "A/C" into ['A','C']
 */
function parseAnswerList(raw) {
  return raw
    .split(/[\s,\/&]+|(?:\band\b)/i)
    .map(s => s.trim().toUpperCase())
    .filter(s => /^[A-E]$/.test(s));
}

/**
 * Determine question type from options and correct-answer count.
 */
function detectQuestionType(options, correctAnswers, parsingMode) {
  // Override if mode is explicit
  if (parsingMode === 'true_false') return 'true_false';
  if (parsingMode === 'multi_select') return 'multi';
  if (parsingMode === 'multiple_choice') return 'single';

  // True/False: options are T/F or True/False
  if (options.length === 2) {
    const keys = options.map(o => o.text.toLowerCase());
    if (
      (keys.includes('true') && keys.includes('false')) ||
      (keys.every(k => RE_TF_OPTION.test(k)))
    ) {
      return 'true_false';
    }
  }

  // No options but options count is 0 — try text of stem for T/F phrasing
  if (options.length === 0) {
    // Could be a T/F question with no explicit options listed
    if (correctAnswers.length > 0 &&
        correctAnswers.every(a => /^(T|F|TRUE|FALSE)$/i.test(a))) {
      return 'true_false';
    }
  }

  // Multi-select: more than one correct answer
  if (correctAnswers.length > 1) return 'multi';

  return 'single';
}

/**
 * Score confidence based on completeness of extracted fields.
 * Returns 0.0 – 1.0.
 */
function scoreConfidence({ stem, options, correctAnswers, explanation }) {
  let score = 0;

  // Stem present and non-trivial
  if (stem && stem.length > 10) score += 0.30;
  else if (stem && stem.length > 3) score += 0.15;

  // Has 2+ options
  if (options.length >= 4) score += 0.30;
  else if (options.length >= 2) score += 0.20;

  // Has answer key
  if (correctAnswers.length > 0) score += 0.25;

  // Has explanation
  if (explanation) score += 0.15;

  return Math.min(Math.round(score * 1000) / 1000, 1.0);
}

/**
 * Build aggregate stats over the parsed question array.
 */
function buildStats(questions) {
  const total = questions.length;
  const withAnswers = questions.filter(q => q.correctAnswers.length > 0).length;
  const withExplanations = questions.filter(q => q.explanation).length;
  const multiSelect = questions.filter(q => q.questionType === 'multi').length;
  const trueFalse = questions.filter(q => q.questionType === 'true_false').length;
  const avgConfidence = total === 0
    ? 0
    : Math.round((questions.reduce((s, q) => s + q.confidence, 0) / total) * 1000) / 1000;
  const highConfidence = questions.filter(q => q.confidence >= 0.7).length;
  const lowConfidence = questions.filter(q => q.confidence < 0.4).length;

  return {
    total,
    withAnswers,
    withExplanations,
    multiSelect,
    trueFalse,
    singleChoice: total - multiSelect - trueFalse,
    avgConfidence,
    highConfidence,
    lowConfidence,
  };
}
