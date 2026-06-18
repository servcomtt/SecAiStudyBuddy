-- =============================================================================
-- Study Buddy — Question Bank Schema  (SQLite)
-- =============================================================================
-- Run AFTER schema.sqlite.sql.  Adds 5 tables that power the instructor-side
-- Question Import Manager and the database-backed question bank.
--
-- Table inventory
--   question_assets        Extracted images from uploaded documents
--   question_import_jobs   Tracks each instructor upload job
--   question_import_items  Per-question drafts extracted from a job
--   question_bank          Live, approved canonical questions
--   question_revisions     Full audit log of every question edit
-- =============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── question_assets ───────────────────────────────────────────────────────────
-- Stores image files extracted from uploaded PDFs/DOCX files.
-- Images are saved to disk (uploads/question-imports/<id>.<ext>).

CREATE TABLE IF NOT EXISTS question_assets (
  id               TEXT PRIMARY KEY,
  import_job_id    TEXT REFERENCES question_import_jobs(id) ON DELETE SET NULL,
  storage_path     TEXT NOT NULL,          -- relative path from server root
  original_filename TEXT,
  mime_type        TEXT NOT NULL DEFAULT 'image/png',
  width            INTEGER,
  height           INTEGER,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_qassets_job ON question_assets(import_job_id);


-- ── question_import_jobs ──────────────────────────────────────────────────────
-- One row per instructor upload.  Drives the import pipeline state machine:
--   pending → processing → review → (published | failed)

CREATE TABLE IF NOT EXISTS question_import_jobs (
  id                   TEXT PRIMARY KEY,
  instructor_user_id   TEXT NOT NULL REFERENCES users(id),
  course_id            TEXT REFERENCES courses(id),
  module_id            TEXT REFERENCES modules(id),
  source_filename      TEXT NOT NULL,
  source_type          TEXT NOT NULL CHECK(source_type IN
                         ('pdf','docx','image','scanned_pdf','mixed')),
  status               TEXT NOT NULL DEFAULT 'pending' CHECK(status IN
                         ('pending','processing','review','published','failed')),
  parsing_mode         TEXT DEFAULT 'auto' CHECK(parsing_mode IN
                         ('auto','multiple_choice','multi_select','true_false','mixed')),
  total_detected       INTEGER NOT NULL DEFAULT 0,
  total_approved       INTEGER NOT NULL DEFAULT 0,
  total_published      INTEGER NOT NULL DEFAULT 0,
  error_log            TEXT,               -- JSON array of error strings
  ocr_used             INTEGER NOT NULL DEFAULT 0,  -- 1 if OCR fallback was used
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at         TEXT
);

CREATE INDEX IF NOT EXISTS idx_qjobs_instructor ON question_import_jobs(instructor_user_id);
CREATE INDEX IF NOT EXISTS idx_qjobs_course     ON question_import_jobs(course_id);
CREATE INDEX IF NOT EXISTS idx_qjobs_status     ON question_import_jobs(status);


-- ── question_import_items ─────────────────────────────────────────────────────
-- One row per extracted question draft.  Stays in this table until approved
-- (at which point a row is written to question_bank).

CREATE TABLE IF NOT EXISTS question_import_items (
  id                       TEXT PRIMARY KEY,
  import_job_id            TEXT NOT NULL REFERENCES question_import_jobs(id)
                             ON DELETE CASCADE,
  detected_question_number INTEGER,        -- as parsed from source (1, 2, ...)
  question_text            TEXT NOT NULL,
  option_json              TEXT,           -- JSON: [{"key":"A","text":"..."},...]
  correct_answer_json      TEXT,           -- JSON: ["A"] or ["A","C"] for multi
  explanation_text         TEXT,
  image_asset_id           TEXT REFERENCES question_assets(id) ON DELETE SET NULL,
  confidence_score         REAL NOT NULL DEFAULT 0.0,  -- 0.0–1.0
  review_status            TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN
                             ('pending','approved','rejected','duplicate')),
  question_type            TEXT NOT NULL DEFAULT 'single' CHECK(question_type IN
                             ('single','multi','true_false')),
  domain                   TEXT,           -- e.g. 'Data Analysis'
  difficulty               TEXT CHECK(difficulty IN ('easy','medium','hard')),
  raw_ocr_text             TEXT,           -- raw text before cleanup
  duplicate_of_item_id     TEXT REFERENCES question_import_items(id),
  reviewer_note            TEXT,
  created_at               TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_qitems_job    ON question_import_items(import_job_id);
CREATE INDEX IF NOT EXISTS idx_qitems_status ON question_import_items(review_status);


-- ── question_bank ─────────────────────────────────────────────────────────────
-- Canonical, instructor-approved question store.
-- This is the source of truth; the JS QUIZ_BANK export is derived from here.

CREATE TABLE IF NOT EXISTS question_bank (
  id                    TEXT PRIMARY KEY,
  course_id             TEXT NOT NULL REFERENCES courses(id),
  module_id             TEXT REFERENCES modules(id),
  domain                TEXT,
  question_text         TEXT NOT NULL,
  option_json           TEXT NOT NULL,     -- JSON: [{"key":"A","text":"..."},...]
  answer_json           TEXT NOT NULL,     -- JSON: ["A"] or ["A","C"]
  explanation_text      TEXT,
  image_asset_id        TEXT REFERENCES question_assets(id) ON DELETE SET NULL,
  difficulty            TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN
                          ('easy','medium','hard')),
  question_type         TEXT NOT NULL DEFAULT 'single' CHECK(question_type IN
                          ('single','multi','true_false')),
  status                TEXT NOT NULL DEFAULT 'published' CHECK(status IN
                          ('draft','published','archived')),
  version               INTEGER NOT NULL DEFAULT 1,
  source_import_item_id TEXT REFERENCES question_import_items(id) ON DELETE SET NULL,
  created_by            TEXT REFERENCES users(id),
  updated_by            TEXT REFERENCES users(id),
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_qbank_course     ON question_bank(course_id);
CREATE INDEX IF NOT EXISTS idx_qbank_module     ON question_bank(module_id);
CREATE INDEX IF NOT EXISTS idx_qbank_status     ON question_bank(status);
CREATE INDEX IF NOT EXISTS idx_qbank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_qbank_domain     ON question_bank(domain);

-- Auto-update updated_at
CREATE TRIGGER IF NOT EXISTS trg_qbank_updated_at
  AFTER UPDATE ON question_bank
  FOR EACH ROW BEGIN
    UPDATE question_bank SET updated_at = datetime('now') WHERE id = NEW.id;
  END;


-- ── question_revisions ────────────────────────────────────────────────────────
-- Full audit log — every edit, publish, archive, and restore is recorded.

CREATE TABLE IF NOT EXISTS question_revisions (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id        TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  changed_by         TEXT REFERENCES users(id),
  change_type        TEXT NOT NULL CHECK(change_type IN
                       ('create','edit','publish','archive','restore','import')),
  previous_data_json TEXT,   -- JSON snapshot before change
  new_data_json      TEXT,   -- JSON snapshot after change
  changed_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_qrev_question ON question_revisions(question_id);
CREATE INDEX IF NOT EXISTS idx_qrev_changed  ON question_revisions(changed_at);


-- ── Reporting view: question bank summary ─────────────────────────────────────

CREATE VIEW IF NOT EXISTS vw_question_bank_summary AS
SELECT
  c.slug                                                          AS course_slug,
  m.slug                                                          AS module_slug,
  qb.domain,
  qb.difficulty,
  COUNT(*)                                                        AS total,
  SUM(CASE WHEN qb.status = 'published' THEN 1 ELSE 0 END)      AS published,
  SUM(CASE WHEN qb.status = 'draft'     THEN 1 ELSE 0 END)      AS drafts,
  SUM(CASE WHEN qb.status = 'archived'  THEN 1 ELSE 0 END)      AS archived
FROM question_bank qb
JOIN courses c  ON c.id = qb.course_id
LEFT JOIN modules m ON m.id = qb.module_id
GROUP BY c.slug, m.slug, qb.domain, qb.difficulty;
