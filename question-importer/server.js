'use strict';

/**
 * question-importer/server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Microservice that:
 *   1. Accepts file uploads (PDF, DOCX, image, scanned PDF)
 *   2. Runs the parsing pipeline (text extraction → question detection)
 *   3. POSTs results back to the LMS API so they appear in the review queue
 *
 * Environment variables (see .env.example):
 *   IMPORTER_PORT   default 3003
 *   LMS_URL         e.g. http://lms:3001   (internal Docker network)
 *   LMS_API_KEY     shared secret for LMS admin calls
 *   UPLOAD_DIR      path for temp uploads   default /tmp/qimport-uploads
 *   RESULTS_DIR     path for extracted images  default /tmp/qimport-results
 *   MAX_FILE_MB     max upload size in MB     default 50
 */

const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

const { parsePdf }          = require('./parsers/pdf-parser');
const { parseDocx }         = require('./parsers/docx-parser');
const { detectQuestions }   = require('./parsers/question-detector');

// ── Config ────────────────────────────────────────────────────────────────────

const PORT        = parseInt(process.env.IMPORTER_PORT || '3003', 10);
const LMS_URL     = (process.env.LMS_URL || 'http://localhost:3001').replace(/\/$/, '');
const LMS_API_KEY = process.env.LMS_API_KEY || '';
const IMPORTER_API_KEY = process.env.IMPORTER_API_KEY || LMS_API_KEY;
const IMPORTER_CORS_ORIGIN = process.env.IMPORTER_CORS_ORIGIN || process.env.CORS_ORIGIN || false;
const UPLOAD_DIR  = process.env.UPLOAD_DIR  || '/tmp/qimport-uploads';
const RESULTS_DIR = process.env.RESULTS_DIR || '/tmp/qimport-results';
const MAX_FILE_MB = parseInt(process.env.MAX_FILE_MB || '50', 10);

fs.mkdirSync(UPLOAD_DIR,  { recursive: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ── Multer storage ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const safe = uuidv4() + ext;
    cb(null, safe);
  },
});

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
  'image/bmp',
]);

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(cors({
  origin: IMPORTER_CORS_ORIGIN || false,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

function importerAuth(req, res, next) {
  if (!IMPORTER_API_KEY) {
    return res.status(503).json({ error: 'Importer authentication is not configured.' });
  }
  const incoming = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (incoming !== IMPORTER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

// ── Liveness probe ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'question-importer' }));

// ── POST /parse  (main endpoint) ─────────────────────────────────────────────
//
// Body (multipart/form-data):
//   file          — the document to import
//   job_id        — UUID issued by LMS (pre-created job)
//   parsing_mode  — 'auto' | 'multiple_choice' | 'multi_select' | 'true_false' | 'mixed'
//   callback_url  — optional override for LMS callback (defaults to LMS_URL)

app.post('/parse', importerAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const jobId       = req.body.job_id;
  const parsingMode = req.body.parsing_mode || 'auto';
  const callbackUrl = LMS_URL.replace(/\/$/, '');

  if (!jobId) {
    return res.status(400).json({ error: 'job_id is required.' });
  }

  // Respond immediately — processing is async
  res.json({ status: 'accepted', job_id: jobId, message: 'Parsing started.' });

  // Run pipeline in background
  runPipeline({ jobId, file: req.file, parsingMode, callbackUrl }).catch(err => {
    console.error(`[importer] Pipeline error for job ${jobId}:`, err);
    notifyLms(callbackUrl, jobId, 'failed', [], [], `Pipeline crashed: ${err.message}`);
  });
});

// ── Pipeline ──────────────────────────────────────────────────────────────────

async function runPipeline({ jobId, file, parsingMode, callbackUrl }) {
  const { path: filePath, originalname, mimetype } = file;
  const imageOutDir = path.join(RESULTS_DIR, jobId);
  const errors      = [];

  console.log(`[importer] Job ${jobId} — parsing ${originalname} (${mimetype})`);

  try {
    // ── 1. Notify LMS: processing started
    await notifyLms(callbackUrl, jobId, 'processing', [], [], null);

    // ── 2. Extract text + images from source document
    let text     = '';
    let ocrUsed  = false;
    let rawImages = [];

    if (mimetype === 'application/pdf') {
      const result = await parsePdf(filePath, imageOutDir);
      text      = result.text;
      ocrUsed   = result.ocrUsed;
      rawImages = result.images;
      if (result.warnings.length) errors.push(...result.warnings);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await parseDocx(filePath, imageOutDir);
      text      = result.text;
      rawImages = result.images;
      if (result.warnings.length) errors.push(...result.warnings);
    } else if (mimetype.startsWith('image/')) {
      // Single scanned image — run OCR directly
      ocrUsed = true;
      try {
        const Tesseract = require('tesseract.js');
        const { data: { text: ocrText } } = await Tesseract.recognize(filePath, 'eng', {
          logger: () => {},
        });
        text = ocrText.trim();
      } catch (e) {
        errors.push(`OCR failed for image: ${e.message}`);
      }
    }

    if (!text || text.trim().length < 10) {
      throw new Error('Extracted text is empty or too short for question detection.');
    }

    // ── 3. Detect questions
    const { questions, stats } = detectQuestions(text, { parsingMode });

    console.log(`[importer] Job ${jobId} — detected ${stats.total} questions (avg confidence: ${stats.avgConfidence})`);

    if (stats.total === 0) {
      throw new Error('No questions were detected in the document.');
    }

    // ── 4. Build payload for LMS
    const items = questions.map((q, idx) => ({
      detected_question_number : q.questionNumber ?? (idx + 1),
      question_text            : q.stem,
      option_json              : JSON.stringify(q.options.map(o => ({ key: o.key, text: o.text }))),
      correct_answer_json      : JSON.stringify(q.correctAnswers),
      explanation_text         : q.explanation || null,
      question_type            : q.questionType,
      confidence_score         : q.confidence,
      raw_ocr_text             : ocrUsed ? q.rawText : null,
      difficulty               : null,   // instructor sets this in review
      domain                   : null,   // instructor sets this in review
      review_status            : 'pending',
    }));

    // ── 5. Build image asset payloads
    const imageAssets = rawImages.map(img => ({
      storage_path      : img.filePath,
      original_filename : img.filename,
      mime_type         : img.mimeType,
      width             : img.width  || null,
      height            : img.height || null,
    }));

    // ── 6. POST results to LMS
    await notifyLms(callbackUrl, jobId, 'review', items, imageAssets, null, {
      ocr_used       : ocrUsed,
      total_detected : stats.total,
      error_log      : errors.length ? errors : null,
    });

    console.log(`[importer] Job ${jobId} — results posted to LMS.`);

  } catch (err) {
    console.error(`[importer] Job ${jobId} failed:`, err.message);
    await notifyLms(callbackUrl, jobId, 'failed', [], [], err.message);
  } finally {
    // Clean up the uploaded source file
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }
}

// ── LMS callback ──────────────────────────────────────────────────────────────

async function notifyLms(baseUrl, jobId, status, items, imageAssets, errorMessage, extra = {}) {
  const url = `${baseUrl}/api/admin/question-imports/${encodeURIComponent(jobId)}/results`;

  const body = {
    status,
    items        : items || [],
    image_assets : imageAssets || [],
    error_message: errorMessage || null,
    ...extra,
  };

  try {
    // Use native fetch (Node 18+) or fallback to node-fetch
    const fetchFn = globalThis.fetch || require('node-fetch');
    const resp = await fetchFn(url, {
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${LMS_API_KEY}`,
        'X-Service'     : 'question-importer',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error(`[importer] LMS callback ${url} returned ${resp.status}: ${text}`);
    }
  } catch (err) {
    console.error(`[importer] Failed to notify LMS at ${url}:`, err.message);
  }
}

// ── Error handler ─────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `File too large. Maximum is ${MAX_FILE_MB} MB.` });
  }
  console.error('[importer] Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[importer] Question importer listening on port ${PORT}`);
    console.log(`[importer] LMS URL: ${LMS_URL}`);
    console.log(`[importer] Upload dir: ${UPLOAD_DIR}`);
  });
}

module.exports = app;   // for testing
