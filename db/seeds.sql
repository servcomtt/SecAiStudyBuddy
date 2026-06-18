-- =============================================================
-- Study Buddy — Seed Data
-- Works with both PostgreSQL and SQLite.
-- Run AFTER schema creation.
--
-- Provides:
--   • 1 admin user     (admin@studybuddy.local / changeme123)
--   • 1 demo student   (student@studybuddy.local / changeme123)
--   • 1 course         CompTIA SecAI+ (CY0-001)
--   • 8 modules        ch1 … ch8
--   • 24 lab records   matching every activity_id in labs.js
--   • 2 enrollments    both demo users enrolled in SecAIPlus
--   • 2 entitlements   student gets access to all labs
--
-- IMPORTANT: Replace password hashes before production use.
-- Hashes below are bcrypt rounds=10 of "changeme123".
-- Generate fresh hashes:  node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
-- =============================================================


-- =============================================================
-- USERS
-- =============================================================

INSERT INTO users (id, email, display_name, password_hash, role, is_active, settings_json)
VALUES
  (
    'u-admin-0000-0000-000000000001',
    'admin@studybuddy.local',
    'Study Buddy Admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- changeme123
    'admin',
    1,
    '{}'
  ),
  (
    'u-demo-0000-0000-000000000002',
    'student@studybuddy.local',
    'Demo Student',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- changeme123
    'student',
    1,
    '{"fontSize":"15","fontFamily":"system","lineHeight":"1.6","theme":"default","reduceMotion":"0","boldText":"0","underlineLinks":"0"}'
  );


-- =============================================================
-- COURSES
-- =============================================================

INSERT INTO courses (id, slug, exam_code, title, description, vendor, version, chapter_count, passing_score, is_active)
VALUES (
  'c-secaiplus-0000-000000000001',
  'secaiplus',
  'CY0-001',
  'CompTIA SecAI+',
  'Validates the skills required to transform business requirements in support of data-driven decisions. Covers data concepts, mining, analysis, visualization, and governance.',
  'CompTIA',
  '2024',
  8,
  70.00,
  1
);


-- =============================================================
-- MODULES  (ch1 – ch8)
-- topic_count / flashcard_count / quiz_question_count match
-- the values defined in index.html.
-- =============================================================

INSERT INTO modules (id, course_id, slug, title, sort_order, topic_count, flashcard_count, quiz_question_count, is_active)
VALUES
  ('m-ch1-0000-0000-000000000001', 'c-secaiplus-0000-000000000001', 'ch1', 'Today''s Data Analyst',               1, 7, 10, 10, 1),
  ('m-ch2-0000-0000-000000000002', 'c-secaiplus-0000-000000000001', 'ch2', 'Understanding Data',                  2, 8, 10, 10, 1),
  ('m-ch3-0000-0000-000000000003', 'c-secaiplus-0000-000000000001', 'ch3', 'Databases & Data Acquisition',        3, 8, 10, 10, 1),
  ('m-ch4-0000-0000-000000000004', 'c-secaiplus-0000-000000000001', 'ch4', 'Data Quality',                        4, 7, 10, 10, 1),
  ('m-ch5-0000-0000-000000000005', 'c-secaiplus-0000-000000000001', 'ch5', 'Data Analysis & Statistics',          5, 8, 10, 10, 1),
  ('m-ch6-0000-0000-000000000006', 'c-secaiplus-0000-000000000001', 'ch6', 'Data Analytics Tools',               6, 7, 10, 10, 1),
  ('m-ch7-0000-0000-000000000007', 'c-secaiplus-0000-000000000001', 'ch7', 'Visualization & Dashboards',          7, 8, 10, 10, 1),
  ('m-ch8-0000-0000-000000000008', 'c-secaiplus-0000-000000000001', 'ch8', 'Data Governance',                     8, 7, 10, 10, 1);


-- =============================================================
-- LABS  (activity_id must match labs.js LABS[ch].activities[].id)
-- =============================================================

INSERT INTO labs (id, module_id, activity_id, title, lab_type, instructions, max_score, passing_score, sort_order, is_active)
VALUES
  -- Ch 1
  ('l-ch1-01', 'm-ch1-0000-0000-000000000001', 'ch1-lab-order', 'Analytics Process Order',              'click-order', 'Arrange the five analytics process steps in the correct sequence.',        100, 70, 1, 1),
  ('l-ch1-02', 'm-ch1-0000-0000-000000000001', 'ch1-lab-match', 'Analytics Types Match',               'click-match', 'Click a card to select it, then click the correct category zone.',        100, 70, 2, 1),

  -- Ch 2
  ('l-ch2-01', 'm-ch2-0000-0000-000000000002', 'ch2-lab-match', 'Data Structure Categories',           'click-match', 'Drag each item to the correct data structure category.',                  100, 70, 1, 1),
  ('l-ch2-02', 'm-ch2-0000-0000-000000000002', 'ch2-lab-fill',  'Data Type Definitions Fill-In',       'fill-blank',  'Type the correct CompTIA data type term for each definition.',             100, 70, 2, 1),
  ('l-ch2-03', 'm-ch2-0000-0000-000000000002', 'ch2-lab-code',  'Python: Exploring Data Types',        'code-lab',    'Run each cell to explore Python data types.',                              100, 70, 3, 1),

  -- Ch 3
  ('l-ch3-01', 'm-ch3-0000-0000-000000000003', 'ch3-lab-match', 'Database Concepts Match',             'click-match', 'Drag each item to its correct database concept category.',                 100, 70, 1, 1),
  ('l-ch3-02', 'm-ch3-0000-0000-000000000003', 'ch3-lab-etl',   'ETL Process Order',                   'click-order', 'Drag the ETL steps into the correct order.',                               100, 70, 2, 1),
  ('l-ch3-03', 'm-ch3-0000-0000-000000000003', 'ch3-lab-code',  'Python: Relational Data Simulation',  'code-lab',    'Work through a full data acquisition and ETL pipeline.',                   100, 70, 3, 1),

  -- Ch 4
  ('l-ch4-01', 'm-ch4-0000-0000-000000000004', 'ch4-lab-fill',  'Data Quality Terms Fill-In',          'fill-blank',  'Type the correct data quality term for each definition.',                  100, 70, 1, 1),
  ('l-ch4-02', 'm-ch4-0000-0000-000000000004', 'ch4-lab-match', 'Data Remediation Match',              'click-match', 'Drag each data issue to its correct fix or solution.',                     100, 70, 2, 1),
  ('l-ch4-03', 'm-ch4-0000-0000-000000000004', 'ch4-lab-code',  'Python: Data Cleaning Workflow',      'code-lab',    'Work through a full data cleaning workflow using built-in Python.',        100, 70, 3, 1),

  -- Ch 5
  ('l-ch5-01', 'm-ch5-0000-0000-000000000005', 'ch5-lab-fill',  'Statistics Terms Fill-In',            'fill-blank',  'Type the correct statistics term for each definition or formula.',         100, 70, 1, 1),
  ('l-ch5-02', 'm-ch5-0000-0000-000000000005', 'ch5-lab-code',  'Python: Core Statistics',             'code-lab',    'Calculate core statistics using pure Python — no libraries needed.',       100, 70, 2, 1),

  -- Ch 6
  ('l-ch6-01', 'm-ch6-0000-0000-000000000006', 'ch6-lab-match', 'Analytics Tools Use Cases',           'click-match', 'Drag each analytics tool to its correct use case.',                        100, 70, 1, 1),
  ('l-ch6-02', 'm-ch6-0000-0000-000000000006', 'ch6-lab-code',  'Python: Analytics Pipeline',          'code-lab',    'Run a mini end-to-end analytics pipeline using Python builtins.',          100, 70, 2, 1),

  -- Ch 7
  ('l-ch7-01', 'm-ch7-0000-0000-000000000007', 'ch7-lab-match', 'Chart Types Match',                   'click-match', 'Drag each scenario to the chart type that best represents it.',            100, 70, 1, 1),
  ('l-ch7-02', 'm-ch7-0000-0000-000000000007', 'ch7-lab-fill',  'Visualization Concepts Fill-In',      'fill-blank',  'Fill in the correct term for each visualization concept.',                 100, 70, 2, 1),
  ('l-ch7-03', 'm-ch7-0000-0000-000000000007', 'ch7-lab-code',  'Python: Chart Construction Logic',    'code-lab',    'Understand chart construction logic using plain Python text output.',      100, 70, 3, 1),

  -- Ch 8
  ('l-ch8-01', 'm-ch8-0000-0000-000000000008', 'ch8-lab-match', 'Governance Roles Match',              'click-match', 'Drag each item to the correct governance role zone.',                      100, 70, 1, 1),
  ('l-ch8-02', 'm-ch8-0000-0000-000000000008', 'ch8-lab-fill',  'Governance Terms Fill-In',            'fill-blank',  'Fill in the correct governance term.',                                     100, 70, 2, 1),
  ('l-ch8-03', 'm-ch8-0000-0000-000000000008', 'ch8-lab-code',  'Python: PII Detection & Masking',     'code-lab',    'Simulate PII detection, data masking, and a governance audit.',            100, 70, 3, 1);


-- =============================================================
-- COURSE ENROLLMENTS
-- =============================================================

INSERT INTO course_enrollments (id, user_id, course_id, enrolled_by, is_active)
VALUES
  ('e-admin-dp-0000000000001', 'u-admin-0000-0000-000000000001', 'c-secaiplus-0000-000000000001', 'u-admin-0000-0000-000000000001', 1),
  ('e-demo-dp-00000000000001', 'u-demo-0000-0000-000000000002',  'c-secaiplus-0000-000000000001', 'u-admin-0000-0000-000000000001', 1);


-- =============================================================
-- USER_LAB_ENTITLEMENTS  (demo student — all SecAIPlus labs)
-- One INSERT per lab; in production auto-generate on enrolment.
-- =============================================================

INSERT INTO user_lab_entitlements (id, user_id, lab_id, granted_by)
SELECT
  'ent-demo-' || l.id,
  'u-demo-0000-0000-000000000002',
  l.id,
  'u-admin-0000-0000-000000000001'
FROM labs l
WHERE l.module_id IN (
  'm-ch1-0000-0000-000000000001',
  'm-ch2-0000-0000-000000000002',
  'm-ch3-0000-0000-000000000003',
  'm-ch4-0000-0000-000000000004',
  'm-ch5-0000-0000-000000000005',
  'm-ch6-0000-0000-000000000006',
  'm-ch7-0000-0000-000000000007',
  'm-ch8-0000-0000-000000000008'
);
