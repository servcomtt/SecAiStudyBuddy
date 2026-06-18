-- =============================================================
-- Study Buddy — PostgreSQL Schema
-- Compatible: PostgreSQL 14+
-- Notes:
--   • All PKs are UUIDs (gen_random_uuid requires pgcrypto or pg ≥ 13)
--   • JSONB used for flexible payloads; index with GIN where queried
--   • updated_at columns are maintained by the set_updated_at() trigger
--   • Row-Level Security (RLS) hints are commented in-line
--   • Two tables are added beyond the original nine:
--       course_enrollments  — explicit enrolment records (access control)
--       quiz_attempts       — chapter + practice quiz tracking, separate
--                             from lab_attempts which track interactive labs
-- =============================================================

-- Enable UUID generation (PostgreSQL < 13 needs pgcrypto)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================
-- 0. SHARED TRIGGER — keep updated_at current
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- =============================================================
-- 1. USERS
--    One row per human. Role controls API access.
--    settings_json mirrors the client-side dsb_settings object
--    so preferences survive across devices.
-- =============================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT        UNIQUE NOT NULL,
    display_name    TEXT,
    password_hash   TEXT,                          -- NULL for SSO-only accounts
    avatar_url      TEXT,
    role            TEXT        NOT NULL DEFAULT 'student'
                                CHECK (role IN ('student', 'instructor', 'admin')),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- Mirrors client SETTINGS_DEFAULTS; synced from db-client.js
    settings_json   JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_active   ON users (is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS hint:
--   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY users_self ON users USING (id = current_setting('app.user_id')::uuid);
--   CREATE POLICY users_admin ON users USING (current_setting('app.role') = 'admin');


-- =============================================================
-- 2. COURSES
--    One row per certification or structured course.
--    slug is used as the URL segment and localStorage key prefix.
-- =============================================================

CREATE TABLE courses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT        UNIQUE NOT NULL,   -- 'secaiplus', 'secplus', 'awsccp'
    exam_code       TEXT,                          -- 'CY0-001', 'SY0-701'
    title           TEXT        NOT NULL,
    description     TEXT,
    vendor          TEXT,                          -- 'CompTIA', 'AWS', 'Microsoft'
    version         TEXT,                          -- exam version string
    chapter_count   SMALLINT    NOT NULL DEFAULT 0,
    passing_score   NUMERIC(5,2) NOT NULL DEFAULT 70.00,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_slug   ON courses (slug);
CREATE INDEX idx_courses_active ON courses (is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- 3. MODULES
--    Chapters / units within a course.
--    slug matches the HTML page ID ('ch1', 'ch2', …).
--    *_count columns duplicate TOPICS/flashcards length for
--    fast progress-percentage calculation without a JOIN.
-- =============================================================

CREATE TABLE modules (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug                TEXT        NOT NULL,       -- 'ch1' … 'chN'
    title               TEXT        NOT NULL,
    sort_order          SMALLINT    NOT NULL DEFAULT 0,
    topic_count         SMALLINT    NOT NULL DEFAULT 0,
    flashcard_count     SMALLINT    NOT NULL DEFAULT 0,
    quiz_question_count SMALLINT    NOT NULL DEFAULT 0,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (course_id, slug)
);

CREATE INDEX idx_modules_course ON modules (course_id, sort_order);


-- =============================================================
-- 4. COURSE_ENROLLMENTS  [ADDED]
--    Explicit enrolment record required before a user can
--    write progress or attempt labs for a course.
--    expires_at supports time-limited licences.
-- =============================================================

CREATE TABLE course_enrollments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    course_id       UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_by     UUID        REFERENCES users(id) ON DELETE SET NULL,  -- admin who granted
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,                   -- NULL = perpetual access
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,

    UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user   ON course_enrollments (user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments (course_id);
CREATE INDEX idx_enrollments_active ON course_enrollments (user_id, course_id)
    WHERE is_active = TRUE;


-- =============================================================
-- 5. LABS
--    One row per interactive lab activity.
--    activity_id matches the id field in labs.js LABS object
--    (e.g. 'ch1-lab-order') so the frontend can look it up.
-- =============================================================

CREATE TABLE labs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id       UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    activity_id     TEXT        UNIQUE NOT NULL,   -- must match labs.js activity.id
    title           TEXT        NOT NULL,
    lab_type        TEXT        NOT NULL
                                CHECK (lab_type IN
                                  ('click-order', 'click-match', 'fill-blank', 'code-lab')),
    instructions    TEXT,
    max_score       SMALLINT    NOT NULL DEFAULT 100,
    passing_score   SMALLINT    NOT NULL DEFAULT 70,
    time_limit_s    INT,                           -- NULL = no time limit
    sort_order      SMALLINT    NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labs_module ON labs (module_id, sort_order);
CREATE INDEX idx_labs_type   ON labs (lab_type);


-- =============================================================
-- 6. USER_LAB_ENTITLEMENTS
--    Fine-grained per-lab access control.
--    Use this when labs are gated (premium content, paid tiers).
--    If all enrolled students can access all labs, populate this
--    table automatically on enrolment via a trigger or server job.
-- =============================================================

CREATE TABLE user_lab_entitlements (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_id          UUID        NOT NULL REFERENCES labs(id)  ON DELETE CASCADE,
    granted_by      UUID        REFERENCES users(id) ON DELETE SET NULL,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,                   -- NULL = never expires
    max_attempts    SMALLINT,                      -- NULL = unlimited

    UNIQUE (user_id, lab_id)
);

CREATE INDEX idx_entitlements_user ON user_lab_entitlements (user_id);
CREATE INDEX idx_entitlements_lab  ON user_lab_entitlements (lab_id);


-- =============================================================
-- 7. LAB_ATTEMPTS
--    One row per lab attempt session.
--    answer_json  — snapshot of the user's submitted answers.
--    feedback_json — per-item correctness returned to client.
-- =============================================================

CREATE TABLE lab_attempts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_id          UUID        NOT NULL REFERENCES labs(id)  ON DELETE CASCADE,
    attempt_number  SMALLINT    NOT NULL DEFAULT 1,
    status          TEXT        NOT NULL DEFAULT 'in_progress'
                                CHECK (status IN
                                  ('in_progress', 'submitted', 'abandoned', 'timed_out')),
    score           NUMERIC(5,2),                  -- 0.00–100.00; NULL until submitted
    passed          BOOLEAN,                       -- NULL until submitted
    time_spent_s    INT,                           -- wall-clock seconds
    answer_json     JSONB,                         -- {itemId: userAnswer, …}
    feedback_json   JSONB,                         -- {itemId: {correct, hint}, …}
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_attempts_user    ON lab_attempts (user_id);
CREATE INDEX idx_lab_attempts_lab     ON lab_attempts (lab_id);
CREATE INDEX idx_lab_attempts_status  ON lab_attempts (status);
CREATE INDEX idx_lab_attempts_score   ON lab_attempts (lab_id, score)
    WHERE status = 'submitted';


-- =============================================================
-- 8. LAB_EVENT_LOG
--    Append-only granular event stream for each lab session.
--    Useful for playback, debugging, and learning analytics.
--
--    Common event_type values:
--      code_run        — user clicked ▶ Run in the IDE
--      answer_check    — user submitted answers for checking
--      item_placed     — click-match: item dropped into zone
--      order_changed   — click-order: item moved up/down
--      blank_filled    — fill-blank: input changed
--      tab_switched    — IDE file tab changed
--      hint_used       — user requested a hint
--      reset           — user clicked ↺ Reset
--      error           — runtime or syntax error (code_lab)
-- =============================================================

CREATE TABLE lab_event_log (
    id              BIGSERIAL   PRIMARY KEY,
    attempt_id      UUID        NOT NULL REFERENCES lab_attempts(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    lab_id          UUID        NOT NULL REFERENCES labs(id)         ON DELETE CASCADE,
    event_type      TEXT        NOT NULL,
    payload_json    JSONB,                         -- event-specific data
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_attempt  ON lab_event_log (attempt_id, created_at);
CREATE INDEX idx_events_user     ON lab_event_log (user_id, created_at);
CREATE INDEX idx_events_type     ON lab_event_log (event_type);
-- GIN index for querying inside payload
CREATE INDEX idx_events_payload  ON lab_event_log USING GIN (payload_json);


-- =============================================================
-- 9. MODULE_PROGRESS
--    One row per (user, module) pair.
--    Mirrors the client-side state object fields so server is
--    the source of truth and localStorage is the offline cache.
--
--    topics_seen  — array of topic indices visited (e.g. {0,1,3})
-- =============================================================

CREATE TABLE module_progress (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    module_id           UUID        NOT NULL REFERENCES modules(id)  ON DELETE CASCADE,
    course_id           UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,

    -- Tab & navigation state
    active_tab          SMALLINT    NOT NULL DEFAULT 0,  -- 0=Topics…5=Summary

    -- Topics
    topics_seen         INT[]       NOT NULL DEFAULT '{}',
    topic_current       SMALLINT    NOT NULL DEFAULT 0,

    -- Flashcards
    flashcard_index     SMALLINT    NOT NULL DEFAULT 0,

    -- Chapter quiz
    quiz_index          SMALLINT    NOT NULL DEFAULT 0,
    quiz_score          NUMERIC(5,2),
    quiz_correct        SMALLINT    NOT NULL DEFAULT 0,
    quiz_attempted      SMALLINT    NOT NULL DEFAULT 0,

    -- Overall
    progress_pct        SMALLINT    NOT NULL DEFAULT 0
                                    CHECK (progress_pct BETWEEN 0 AND 100),
    notes_text          TEXT,
    is_complete         BOOLEAN     NOT NULL DEFAULT FALSE,
    completed_at        TIMESTAMPTZ,
    last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, module_id)
);

CREATE INDEX idx_progress_user        ON module_progress (user_id);
CREATE INDEX idx_progress_course      ON module_progress (user_id, course_id);
CREATE INDEX idx_progress_complete    ON module_progress (user_id, is_complete);
CREATE INDEX idx_progress_topics_gin  ON module_progress USING GIN (topics_seen);

CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON module_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- 10. QUIZ_ATTEMPTS  [ADDED]
--     Tracks chapter quizzes, practice quiz sessions, and
--     acronym quizzes — all distinct from interactive lab_attempts.
--     module_id is NULL for practice/acronym quiz sessions.
--     answer_json: array of {questionId, selected, correct}
-- =============================================================

CREATE TABLE quiz_attempts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    course_id       UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    module_id       UUID        REFERENCES modules(id) ON DELETE CASCADE,  -- NULL for practice/acronym
    quiz_type       TEXT        NOT NULL
                                CHECK (quiz_type IN ('chapter', 'practice', 'acronym')),
    mode            TEXT        NOT NULL DEFAULT 'training'
                                CHECK (mode IN ('training', 'exam')),
    question_count  SMALLINT    NOT NULL,
    correct_count   SMALLINT    NOT NULL DEFAULT 0,
    score           NUMERIC(5,2),
    topics_filter   TEXT[],                        -- domain filter applied (practice quiz)
    answer_json     JSONB,                         -- [{qId, selected, correct}, …]
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user   ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_module ON quiz_attempts (module_id) WHERE module_id IS NOT NULL;
CREATE INDEX idx_quiz_attempts_type   ON quiz_attempts (user_id, quiz_type);


-- =============================================================
-- 11. COMPLETION_CERTIFICATES
--     Issued when a user reaches 100 % on all modules of a course.
--     certificate_number is the human-readable reference printed
--     on the PDF (e.g. SB-DA0001-2026-00042).
--     is_valid / revoked_* allow invalidation without deletion.
-- =============================================================

CREATE TABLE completion_certificates (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    course_id           UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    certificate_number  TEXT        UNIQUE NOT NULL,
    overall_score       NUMERIC(5,2),
    modules_completed   SMALLINT    NOT NULL,
    total_modules       SMALLINT    NOT NULL,
    total_time_s        BIGINT,                    -- sum of time spent across all modules
    pdf_url             TEXT,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_valid            BOOLEAN     NOT NULL DEFAULT TRUE,
    revoked_at          TIMESTAMPTZ,
    revoked_reason      TEXT
);

CREATE INDEX idx_certs_user   ON completion_certificates (user_id);
CREATE INDEX idx_certs_course ON completion_certificates (course_id);
CREATE INDEX idx_certs_valid  ON completion_certificates (user_id) WHERE is_valid = TRUE;


-- =============================================================
-- REPORTING VIEWS
-- =============================================================

-- Per-user course completion summary
CREATE VIEW vw_user_course_summary AS
SELECT
    e.user_id,
    e.course_id,
    c.slug                                                    AS course_slug,
    c.title                                                   AS course_title,
    COUNT(m.id)                                               AS total_modules,
    COUNT(mp.id)    FILTER (WHERE mp.is_complete)             AS modules_complete,
    ROUND(AVG(mp.progress_pct)::NUMERIC, 1)                   AS avg_progress_pct,
    ROUND(AVG(mp.quiz_score)::NUMERIC, 1)                     AS avg_quiz_score,
    SUM(ARRAY_LENGTH(mp.topics_seen, 1))                      AS total_topics_seen,
    MAX(mp.last_active_at)                                    AS last_active_at,
    EXISTS (
      SELECT 1 FROM completion_certificates cc
      WHERE cc.user_id = e.user_id
        AND cc.course_id = e.course_id
        AND cc.is_valid
    )                                                         AS has_certificate
FROM course_enrollments e
JOIN courses c                  ON c.id = e.course_id
JOIN modules m                  ON m.course_id = e.course_id AND m.is_active
LEFT JOIN module_progress mp    ON mp.user_id = e.user_id AND mp.module_id = m.id
WHERE e.is_active
GROUP BY e.user_id, e.course_id, c.slug, c.title;


-- Lab performance per activity
CREATE VIEW vw_lab_performance AS
SELECT
    l.activity_id,
    l.title                                                   AS lab_title,
    l.lab_type,
    m.slug                                                    AS module_slug,
    c.slug                                                    AS course_slug,
    COUNT(la.id)                                              AS total_attempts,
    COUNT(la.id) FILTER (WHERE la.status = 'submitted')       AS submitted_attempts,
    COUNT(la.id) FILTER (WHERE la.passed)                     AS passed_attempts,
    ROUND(AVG(la.score) FILTER (WHERE la.status = 'submitted'), 1) AS avg_score,
    ROUND(AVG(la.time_spent_s) FILTER (WHERE la.status = 'submitted'), 0) AS avg_time_s,
    COUNT(DISTINCT la.user_id)                                AS unique_users
FROM labs l
JOIN modules m          ON m.id = l.module_id
JOIN courses c          ON c.id = m.course_id
LEFT JOIN lab_attempts la ON la.lab_id = l.id
GROUP BY l.id, l.activity_id, l.title, l.lab_type, m.slug, c.slug;


-- Daily active users (last 30 days)
CREATE VIEW vw_daily_active_users AS
SELECT
    DATE_TRUNC('day', last_active_at) AS activity_date,
    course_id,
    COUNT(DISTINCT user_id)           AS dau
FROM module_progress
WHERE last_active_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', last_active_at), course_id
ORDER BY activity_date DESC;


-- Top struggling labs (lowest pass rates, min 10 attempts)
CREATE VIEW vw_struggling_labs AS
SELECT
    l.activity_id,
    l.title,
    l.lab_type,
    COUNT(la.id)                                                AS total_attempts,
    ROUND(100.0 * COUNT(la.id) FILTER (WHERE la.passed) / NULLIF(COUNT(la.id), 0), 1)
                                                                AS pass_rate_pct,
    ROUND(AVG(la.score) FILTER (WHERE la.status = 'submitted'), 1) AS avg_score
FROM labs l
JOIN lab_attempts la ON la.lab_id = l.id AND la.status = 'submitted'
GROUP BY l.id, l.activity_id, l.title, l.lab_type
HAVING COUNT(la.id) >= 10
ORDER BY pass_rate_pct ASC;
