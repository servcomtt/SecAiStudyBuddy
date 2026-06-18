-- =============================================================================
-- Study Buddy — Question Bank Schema  (PostgreSQL)
-- =============================================================================

-- ── question_assets ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id    UUID REFERENCES question_import_jobs(id) ON DELETE SET NULL,
  storage_path     TEXT NOT NULL,
  original_filename TEXT,
  mime_type        TEXT NOT NULL DEFAULT 'image/png',
  width            INTEGER,
  height           INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qassets_job ON question_assets(import_job_id);


-- ── question_import_jobs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_import_jobs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_user_id   UUID NOT NULL REFERENCES users(id),
  course_id            UUID REFERENCES courses(id),
  module_id            UUID REFERENCES modules(id),
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
  error_log            JSONB,
  ocr_used             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_qjobs_instructor ON question_import_jobs(instructor_user_id);
CREATE INDEX IF NOT EXISTS idx_qjobs_course     ON question_import_jobs(course_id);
CREATE INDEX IF NOT EXISTS idx_qjobs_status     ON question_import_jobs(status);


-- ── question_import_items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_import_items (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id            UUID NOT NULL REFERENCES question_import_jobs(id)
                             ON DELETE CASCADE,
  detected_question_number INTEGER,
  question_text            TEXT NOT NULL,
  option_json              JSONB,
  correct_answer_json      JSONB,
  explanation_text         TEXT,
  image_asset_id           UUID REFERENCES question_assets(id) ON DELETE SET NULL,
  confidence_score         NUMERIC(4,3) NOT NULL DEFAULT 0.0,
  review_status            TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN
                             ('pending','approved','rejected','duplicate')),
  question_type            TEXT NOT NULL DEFAULT 'single' CHECK(question_type IN
                             ('single','multi','true_false')),
  domain                   TEXT,
  difficulty               TEXT CHECK(difficulty IN ('easy','medium','hard')),
  raw_ocr_text             TEXT,
  duplicate_of_item_id     UUID REFERENCES question_import_items(id),
  reviewer_note            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qitems_job    ON question_import_items(import_job_id);
CREATE INDEX IF NOT EXISTS idx_qitems_status ON question_import_items(review_status);


-- ── question_bank ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_bank (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             UUID NOT NULL REFERENCES courses(id),
  module_id             UUID REFERENCES modules(id),
  domain                TEXT,
  question_text         TEXT NOT NULL,
  option_json           JSONB NOT NULL,
  answer_json           JSONB NOT NULL,
  explanation_text      TEXT,
  image_asset_id        UUID REFERENCES question_assets(id) ON DELETE SET NULL,
  difficulty            TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN
                          ('easy','medium','hard')),
  question_type         TEXT NOT NULL DEFAULT 'single' CHECK(question_type IN
                          ('single','multi','true_false')),
  status                TEXT NOT NULL DEFAULT 'published' CHECK(status IN
                          ('draft','published','archived')),
  version               INTEGER NOT NULL DEFAULT 1,
  source_import_item_id UUID REFERENCES question_import_items(id) ON DELETE SET NULL,
  created_by            UUID REFERENCES users(id),
  updated_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qbank_course     ON question_bank(course_id);
CREATE INDEX IF NOT EXISTS idx_qbank_module     ON question_bank(module_id);
CREATE INDEX IF NOT EXISTS idx_qbank_status     ON question_bank(status);
CREATE INDEX IF NOT EXISTS idx_qbank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_qbank_domain     ON question_bank(domain);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_qbank_updated_at()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_qbank_updated_at ON question_bank;
CREATE TRIGGER trg_qbank_updated_at
  BEFORE UPDATE ON question_bank
  FOR EACH ROW EXECUTE FUNCTION set_qbank_updated_at();


-- ── question_revisions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_revisions (
  id                 BIGSERIAL PRIMARY KEY,
  question_id        UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  changed_by         UUID REFERENCES users(id),
  change_type        TEXT NOT NULL CHECK(change_type IN
                       ('create','edit','publish','archive','restore','import')),
  previous_data_json JSONB,
  new_data_json      JSONB,
  changed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qrev_question ON question_revisions(question_id);
CREATE INDEX IF NOT EXISTS idx_qrev_changed  ON question_revisions(changed_at DESC);


-- ── Reporting view ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_question_bank_summary AS
SELECT
  c.slug                                                             AS course_slug,
  m.slug                                                             AS module_slug,
  qb.domain,
  qb.difficulty,
  COUNT(*)                                                           AS total,
  COUNT(*) FILTER (WHERE qb.status = 'published')                   AS published,
  COUNT(*) FILTER (WHERE qb.status = 'draft')                       AS drafts,
  COUNT(*) FILTER (WHERE qb.status = 'archived')                    AS archived
FROM question_bank qb
JOIN courses  c ON c.id = qb.course_id
LEFT JOIN modules m ON m.id = qb.module_id
GROUP BY c.slug, m.slug, qb.domain, qb.difficulty;
