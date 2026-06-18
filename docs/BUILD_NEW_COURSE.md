# Build a New Study Buddy Course — Step-by-Step Blueprint

> Use these instructions to recreate this platform for **any certification exam or topic**.
> Replace "CompTIA SecAI+" references with your target subject throughout.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Scaffolding](#2-project-scaffolding)
3. [Database Setup](#3-database-setup)
4. [Build the API Server](#4-build-the-api-server)
5. [Create Your Content](#5-create-your-content)
6. [Build the Frontend SPA](#6-build-the-frontend-spa)
7. [Question Importer Service](#7-question-importer-service)
8. [Lab Orchestrator Service](#8-lab-orchestrator-service)
9. [Security Hardening](#9-security-hardening)
10. [Docker & Docker Compose](#10-docker--docker-compose)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Vercel Static Deployment](#12-vercel-static-deployment)
13. [GitHub Repository Setup](#13-github-repository-setup)
14. [Content Authoring Guide](#14-content-authoring-guide)
15. [Customization Checklist](#15-customization-checklist)
16. [File Reference](#16-file-reference)

---

## 1. Prerequisites

### Tools Required
- **Node.js** 20+ (LTS recommended, tested on 20 and 22)
- **Git**
- **Docker Desktop** (for labs and full-stack mode)
- **A text editor** (VS Code recommended)
- **Python 3.10+** (only for utility scripts and lab containers)

### Accounts
- **GitHub** — source control + CI/CD (Actions)
- **Vercel** — free static frontend hosting (connect to GitHub repo)

### Source Materials You Need
- A **textbook or study guide** (PDF or DOCX) for the topic
- A **question bank** (PDF/DOCX with numbered questions + answer key)
- Optional: **images** referenced by questions (diagrams, screenshots, charts)

---

## 2. Project Scaffolding

### 2.1 Create the directory structure

```
your-project/
  .github/
    workflows/
      ci.yml
  db/
    schema.sqlite.sql
    schema.pg.sql
    schema.qbank.sqlite.sql
    schema.qbank.pg.sql
    seeds.sql
  docs/
  lab-orchestrator/
    lab-environments/
      python/
    server.js
    package.json
    Dockerfile
  materials/          # your source PDFs/DOCX (gitignored)
  middleware/
    security.js
  notebooks/          # optional Jupyter labs
  question-importer/
    parsers/
    tests/
    server.js
    package.json
    Dockerfile
  quiz_images/        # question images (committed)
  scripts/            # utility scripts
  tests/
  uploads/            # runtime uploads (gitignored)
  .env.example
  .gitignore
  .vercelignore
  docker-compose.yml
  Dockerfile.lms
  index.html
  package.json
  server.js
  vercel.json
```

### 2.2 Initialize package.json (root)

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "private": true,
  "description": "YOUR TOPIC — certification exam prep SPA with API backend",
  "main": "server.js",
  "scripts": {
    "start":      "node server.js",
    "dev":        "nodemon server.js",
    "db:init":    "node -e \"const D=require('better-sqlite3'),f=require('fs');const db=new D(process.env.DB_PATH||'db/studybuddy.db');db.exec(f.readFileSync('db/schema.sqlite.sql','utf8'));console.log('Schema applied.')\"",
    "db:seed":    "node -e \"const D=require('better-sqlite3'),f=require('fs');const db=new D(process.env.DB_PATH||'db/studybuddy.db');db.exec(f.readFileSync('db/seeds.sql','utf8'));console.log('Seed data inserted.')\"",
    "db:reset":   "node -e \"const f=require('fs'),p='db/studybuddy.db';if(f.existsSync(p))f.unlinkSync(p);console.log('Database deleted.')\" && npm run db:init && npm run db:seed",
    "db:pg:init": "psql $DATABASE_URL -f db/schema.pg.sql",
    "db:pg:seed": "psql $DATABASE_URL -f db/seeds.sql",
    "test":       "node --test tests/**/*.test.js",
    "test:watch": "node --test --watch tests/**/*.test.js",
    "hash":       "node -e \"require('bcryptjs').hash(process.argv[1],10).then(h=>{console.log(h)})\" --"
  },
  "engines": { "node": ">=20.0.0" },
  "dependencies": {
    "bcryptjs":       "^3.0.3",
    "better-sqlite3": "^12.8.0",
    "cors":           "^2.8.6",
    "express":        "^4.21.0",
    "form-data":      "^4.0.4",
    "jsonwebtoken":   "^9.0.3",
    "multer":         "^2.1.1",
    "node-fetch":     "^3.3.2",
    "uuid":           "^13.0.0"
  },
  "optionalDependencies": {
    "pg":      "^8.20.0",
    "nodemon": "^3.1.14"
  },
  "license": "MIT"
}
```

### 2.3 Create .gitignore

```
node_modules/
.env
db/*.db
db/*.db-wal
db/*.db-shm
materials/*.pdf
materials/*.docx
uploads/
.claude/
public/
__pycache__/
docker-data/
*.log
```

### 2.4 Create .env.example

```bash
# === Ports ===
LMS_PORT=3001
ORCH_PORT=3002
IMPORTER_PORT=3003

# === Security (CHANGE THESE IN PRODUCTION) ===
JWT_SECRET=replace-with-64-char-random-string
WEBHOOK_SECRET=replace-with-another-random-string
LMS_API_KEY=replace-with-long-random-string

# === CORS ===
CORS_ORIGIN=http://localhost:3000

# === Database (leave blank for SQLite, or set PostgreSQL URL) ===
# DATABASE_URL=postgres://user:pass@host:5432/dbname
DB_PATH=db/studybuddy.db

# === Certificates ===
CERT_PREFIX=SB

# === Lab Orchestrator ===
SESSION_TTL_MS=900000
LAB_MEMORY_BYTES=268435456
LAB_CPU_QUOTA=50000

# === Question Importer ===
MAX_FILE_MB=50
IMPORTER_URL=http://localhost:3003
```

---

## 3. Database Setup

### 3.1 Main schema — `db/schema.sqlite.sql`

Copy the schema from the SecAIPlus project. The schema is **topic-agnostic** — it works for any subject. The 11 tables are:

| Table | Purpose | What to customize |
|-------|---------|-------------------|
| `users` | Student/instructor accounts | Nothing — universal |
| `courses` | One row per exam/course | Change seed data (title, exam_code, vendor) |
| `modules` | Chapters within a course | Change count and titles |
| `course_enrollments` | User-to-course mapping | Nothing |
| `labs` | Lab exercise metadata | Change lab types and content |
| `user_lab_entitlements` | Lab access control | Nothing |
| `lab_attempts` | Submission records | Nothing |
| `lab_event_log` | Interaction audit trail | Nothing |
| `module_progress` | Per-chapter progress tracking | Nothing |
| `quiz_attempts` | Quiz session history | Nothing |
| `completion_certificates` | Earned certificates | Change `CERT_PREFIX` |

### 3.2 Question bank schema — `db/schema.qbank.sqlite.sql`

Copy as-is. The 5 tables handle the full import-review-publish pipeline:

| Table | Purpose |
|-------|---------|
| `question_assets` | Extracted images from documents |
| `question_import_jobs` | Upload tracking (state machine) |
| `question_import_items` | Per-question drafts from parsing |
| `question_bank` | Approved, published questions |
| `question_revisions` | Full edit history |

### 3.3 Seed data — `db/seeds.sql`

**This is where you customize for your topic.** Create INSERT statements for:

```sql
-- 1. Your course
INSERT INTO courses (id, slug, exam_code, title, vendor, chapter_count, passing_score, is_active)
VALUES ('uuid-here', 'your-slug', 'EXAM-001', 'Your Course Title', 'Your Vendor', 8, 70, 1);

-- 2. Your modules/chapters (one per chapter)
INSERT INTO modules (id, course_id, slug, title, module_order, is_active)
VALUES ('uuid', 'course-uuid', 'ch1', 'Chapter 1: Introduction', 1, 1);
-- ... repeat for each chapter

-- 3. Your labs (optional)
INSERT INTO labs (id, module_id, activity_id, title, lab_type, max_score, passing_score, sort_order, is_active)
VALUES ('uuid', 'module-uuid', 'act_001', 'Lab: Matching Exercise', 'click-match', 100, 70, 1, 1);
-- ... repeat for each lab

-- 4. Default admin account (optional)
-- Use: npm run hash "YourPassword123!" to get the bcrypt hash
INSERT INTO users (id, email, display_name, password_hash, role, is_active, created_at, updated_at)
VALUES ('uuid', 'admin@yourdomain.com', 'Admin', '$2a$10$HASH_HERE', 'admin', 1, datetime('now'), datetime('now'));
```

### 3.4 PostgreSQL variants

Copy `schema.pg.sql` and `schema.qbank.pg.sql` — same structure but with PostgreSQL syntax (`SERIAL` instead of `AUTOINCREMENT`, `TIMESTAMP` instead of `TEXT`, etc.).

---

## 4. Build the API Server

### 4.1 Copy `server.js` from SecAIPlus

The server is **95% topic-agnostic**. The only parts to change:

| Section | What to change |
|---------|----------------|
| Line ~20: description comment | Update course name |
| `CERT_PREFIX` env var | Change default prefix |
| `issueToken()` — issuer/audience | Change `'studybuddy-api'` / `'studybuddy-app'` to your app name |

**All API endpoints work unchanged** for any topic — auth, courses, progress, labs, quizzes, question bank, admin, certificates.

### 4.2 Copy `middleware/security.js`

This is completely topic-agnostic. Copy as-is for OWASP protection.

### 4.3 Copy `db-client.js`

Browser sync client — topic-agnostic. Copy as-is.

---

## 5. Create Your Content

This is the **most important step** — the content files define your course topic.

### 5.1 quiz_data.js — Your Question Bank

Create a file exporting `QUIZ_BANK` array:

```javascript
const QUIZ_BANK = [
  {
    "num": 1,
    "q": "Your question text here?",
    "opts": [
      ["A", "Option A text"],
      ["B", "Option B text"],
      ["C", "Option C text"],
      ["D", "Option D text"]
    ],
    "ans": "B",              // Single answer: "B", Multi-select: "AC"
    "topic": "Domain Name"   // Category/domain for filtering
  },
  // ... add 50-300+ questions
];

if (typeof module !== 'undefined') module.exports = { QUIZ_BANK };
```

**Domains/Topics**: Define 4-10 domains that match your exam outline. Examples:
- CompTIA SecAI+: "Data Concepts", "Data Mining", "Data Analysis", "Visualization", "Governance"
- AWS SAA: "Compute", "Storage", "Networking", "Security", "Databases"
- CISSP: "Security & Risk Management", "Asset Security", "Security Engineering"

### 5.2 explanations.js — Answer Explanations

```javascript
const EXPLANATIONS = {
  "1": {
    "correct": "<strong>B)</strong> is correct because...",
    "wrong": "<strong>A)</strong> is incorrect because...\n<strong>C)</strong> is incorrect because...",
    "domain": "Domain Name"
  },
  // ... one entry per question number
};

if (typeof module !== 'undefined') module.exports = { EXPLANATIONS };
```

### 5.3 labs.js — Lab Definitions

```javascript
const LABS = {
  "ch1_intro_lab": {
    "title": "Matching Exercise: Key Terms",
    "type": "click-match",      // click-match | click-order | fill-blank | code-lab
    "activity_id": "act_001",
    "items": [
      { "id": 1, "text": "Term A", "match": "Definition A" },
      { "id": 2, "text": "Term B", "match": "Definition B" }
    ]
  },
  "ch3_code_lab": {
    "title": "Hands-On: Data Analysis with Python",
    "type": "code-lab",
    "activity_id": "act_010",
    "cells": [
      { "type": "markdown", "content": "# Instructions\nWrite code to..." },
      { "type": "code", "content": "import pandas as pd\n\n# Your code here" }
    ]
  }
};

if (typeof module !== 'undefined') module.exports = { LABS };
```

**Lab Types:**
| Type | Description | Items Format |
|------|-------------|--------------|
| `click-match` | Drag to match pairs | `[{ id, text, match }]` |
| `click-order` | Arrange in correct sequence | `[{ id, text, order }]` |
| `fill-blank` | Type answers into blanks | `[{ id, prompt, answer, accept[] }]` |
| `code-lab` | Execute code in Docker | `[{ type: "markdown"|"code", content }]` |

### 5.4 question_images.js — Image Mappings (optional)

```javascript
const QUESTION_IMAGES = {
  5:  ["quiz_images/q5_img0.png"],
  12: ["quiz_images/q12_img0.png", "quiz_images/q12_img1.png"],
  // ... map question numbers to their image files
};

if (typeof module !== 'undefined') module.exports = { QUESTION_IMAGES };
```

Place all image files in `quiz_images/` directory.

### 5.5 Content Generation Strategies

**Option A: Manual authoring**
- Write questions directly in quiz_data.js format
- Best for: small question banks (< 100 questions)

**Option B: Use the Question Importer**
1. Place your PDF/DOCX in `materials/`
2. Start the question-importer service
3. Upload via the admin UI
4. Review, edit, approve extracted questions
5. Export to quiz_data.js via `/api/admin/question-bank/export-js`

**Option C: AI-assisted generation**
1. Feed your textbook chapters to an AI (Claude, GPT)
2. Prompt: "Generate 30 multiple-choice questions for [Chapter Title] in this JSON format: ..."
3. Provide the `quiz_data.js` schema as the target format
4. Review and validate all generated content
5. Use `scripts/generate_explanations.py` pattern for bulk explanation generation

**Option D: Hybrid**
- Import existing question banks via PDF (Option B)
- Fill gaps with AI-generated questions (Option C)
- Manual polish and review (Option A)

---

## 6. Build the Frontend SPA

### 6.1 Copy `index.html` from SecAIPlus

The SPA is a single 6,781-line HTML file with inline CSS and JavaScript. To adapt for a new topic:

### 6.2 What to Customize in index.html

| Section | Lines (approx) | What to Change |
|---------|-----------------|----------------|
| `<title>` tag | ~1 | Your app name |
| Logo/brand text | ~50 | Your brand name and tagline |
| CSS color scheme | ~100-200 | `--primary`, `--accent` CSS variables |
| Dashboard welcome text | ~1000 | Course description, milestones |
| Chapter/module titles | ~1500 | Your chapter names and descriptions |
| Topic lists per chapter | ~2000 | Your topic names per module |
| Flashcard content | ~2500 | Your flashcard terms/definitions |
| Domain filter labels | ~3000 | Your domain/topic names |
| Footer text | ~6700 | Your copyright, links |

### 6.3 Key JavaScript Functions (no changes needed)

These work for any topic — they read from the global data objects:

| Function | What It Does |
|----------|--------------|
| `renderDashboard()` | Shows enrolled courses, progress bars |
| `renderLesson(ch)` | Displays chapter topics, flashcards, quiz |
| `renderQuizScreen()` | Pulls from `QUIZ_BANK`, shows question UI |
| `renderLabScreen(id)` | Reads from `LABS`, renders lab-type-specific UI |
| `saveToDB()` | Syncs progress to server via `db-client.js` |
| `loadFromDB()` | Restores state from server |
| `renderAdminPanel()` | User management, question bank, reports |

### 6.4 Content References in index.html

The SPA loads these globals via `<script>` tags (must be loaded before index.html's scripts):

```html
<script src="quiz_data.js"></script>
<script src="explanations.js"></script>
<script src="labs.js"></script>
<script src="question_images.js"></script>
<script src="db-client.js"></script>
```

---

## 7. Question Importer Service

### 7.1 Copy the entire `question-importer/` directory

The importer is **topic-agnostic** — it parses document structure, not domain content.

### 7.2 What to Customize

| File | Customization |
|------|---------------|
| `parsers/question-detector.js` | Add regex patterns if your source material uses unusual formatting (e.g., "Problem 1:" instead of "Q1." or "1.") |
| `server.js` | Update `LMS_CALLBACK_URL` if your LMS is at a different address |
| `package.json` | Update name/description |

### 7.3 Question Detector Patterns

The detector looks for these patterns (customize if needed):

```
Questions:  /^\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})[.):\s]/
Options:    /^\s*([A-F])[.):\s]/
Answers:    /^\s*(?:Answer|Correct|Key)[:\s]*([A-F](?:\s*[,&]\s*[A-F])*)/i
Explanation:/^\s*(?:Explanation|Rationale|Why)[:\s]/i
```

If your PDFs use formats like "Problem 1:", "Item 1.", or "1)" — add those patterns.

---

## 8. Lab Orchestrator Service

### 8.1 Copy the entire `lab-orchestrator/` directory

### 8.2 What to Customize

| Component | Customization |
|-----------|---------------|
| `lab-environments/python/Dockerfile` | Change pre-installed packages for your domain |
| `lab-environments/python/runner.py` | Add domain-specific validation if needed |
| Add new lab environments | Create `lab-environments/r/`, `lab-environments/sql/`, etc. |

### 8.3 Example: Adding a New Lab Environment

For an SQL-focused course:

```dockerfile
# lab-environments/sql/Dockerfile
FROM postgres:16-alpine
COPY init.sql /docker-entrypoint-initdb.d/
COPY runner.sh /runner.sh
USER postgres
EXPOSE 5432
CMD ["postgres"]
```

For an R/Statistics course:

```dockerfile
# lab-environments/r/Dockerfile
FROM r-base:4.4.0
RUN R -e "install.packages(c('tidyverse','ggplot2','dplyr'))"
COPY runner.R /runner.R
USER 1000
EXPOSE 8080
CMD ["Rscript", "/runner.R"]
```

---

## 9. Security Hardening

### 9.1 Copy `middleware/security.js` as-is

All security features are topic-agnostic:

| Feature | Protection |
|---------|------------|
| `RateLimiter` | Brute-force prevention (100 req/min global, 15 req/15min auth) |
| `securityHeaders()` | CSP, HSTS, X-Frame-Options, Permissions-Policy |
| `inputSanitizer()` | XSS, prototype pollution, HTML injection |
| `validatePassword()` | 12+ chars, complexity requirements |
| `validateEmail()` | RFC 5322 format validation |
| `AccountLockout` | Lock after 5 failed logins for 15 minutes |
| `csrfHeaderCheck()` | CSRF token verification |
| `bodySizeLimit()` | 1MB request body cap |

### 9.2 Server.js Security Integration

The following security setup in server.js works unchanged:

```javascript
// Disable fingerprinting
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware stack (order matters)
app.use(securityHeaders());
app.use(globalRateLimiter.middleware());
app.use(cors({ origin, methods, headers, credentials, maxAge }));
app.use(csrfHeaderCheck);
app.use(bodySizeLimit(1024 * 1024));
app.use(express.json({ limit: '1mb' }));
app.use(inputSanitizer());
```

---

## 10. Docker & Docker Compose

### 10.1 Copy all Dockerfiles and docker-compose.yml

### 10.2 What to Customize

| File | Change |
|------|--------|
| `docker-compose.yml` | Service names, image names, port mappings |
| `Dockerfile.lms` | COPY paths if you renamed files |
| `lab-orchestrator/lab-environments/python/Dockerfile` | Pre-installed Python packages for your domain |

### 10.3 docker-compose.yml Template

```yaml
version: '3.9'

networks:
  appnet:

volumes:
  app-db:
  import-uploads:
  import-results:

services:
  lms:
    build:
      context: .
      dockerfile: Dockerfile.lms
    ports: ["3001:3001"]
    env_file: .env
    volumes:
      - app-db:/app/db
    depends_on: [lab-orchestrator, question-importer]
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health',r=>{process.exit(r.statusCode===200?0:1)})"]
      interval: 15s
      retries: 3
    networks: [appnet]

  lab-orchestrator:
    build: ./lab-orchestrator
    ports: ["3002:3002"]
    env_file: .env
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3002/health',r=>{process.exit(r.statusCode===200?0:1)})"]
      interval: 10s
    networks: [appnet]

  question-importer:
    build: ./question-importer
    ports: ["3003:3003"]
    env_file: .env
    volumes:
      - import-uploads:/tmp/qimport-uploads
      - import-results:/app/results
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3003/health',r=>{process.exit(r.statusCode===200?0:1)})"]
      interval: 20s
    networks: [appnet]
```

---

## 11. CI/CD Pipeline

### 11.1 Copy `.github/workflows/ci.yml`

### 11.2 What to Customize

| Setting | Change |
|---------|--------|
| Docker image names | `secaiplus-lms` -> `your-project-lms` |
| Node test matrix | Keep `[20, 22]` unless you need different versions |
| `JWT_SECRET` in test env | Any random string (tests only) |

### 11.3 Dependabot — `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
  - package-ecosystem: "npm"
    directory: "/lab-orchestrator"
    schedule: { interval: "weekly" }
  - package-ecosystem: "npm"
    directory: "/question-importer"
    schedule: { interval: "weekly" }
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "weekly" }
```

---

## 12. Vercel Static Deployment

### 12.1 Copy `vercel.json` and `.vercelignore`

### 12.2 What to Customize in vercel.json

Update the `buildCommand` to copy your specific JS data files:

```json
{
  "framework": null,
  "installCommand": "echo 'skip install'",
  "buildCommand": "mkdir -p public/quiz_images && cp index.html public/ && cp -r quiz_images/* public/quiz_images/ && cp explanations.js labs.js quiz_data.js question_images.js db-client.js public/ 2>/dev/null || true",
  "outputDirectory": "public",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 12.3 Vercel Dashboard Settings

After connecting your GitHub repo to Vercel:
1. Go to Project Settings > General
2. Set **Framework Preset** to **Other**
3. Set **Node.js Version** to **22.x**
4. These settings prevent Vercel from auto-detecting Express and trying to run `npm install`

### 12.4 .vercelignore

```
server.js
db-client.js
middleware/
db/
tests/
scripts/
notebooks/
materials/
lab-orchestrator/
question-importer/
docker-compose.yml
Dockerfile*
.env*
*.sql
*.db
node_modules/
```

---

## 13. GitHub Repository Setup

### 13.1 Initialize and Push

```bash
cd your-project
git init
git add .
git commit -m "Initial commit: YOUR_TOPIC study platform"

# Create repo on GitHub (private recommended)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 13.2 Connect Vercel

1. Go to vercel.com > New Project
2. Import your GitHub repo
3. Configure as described in Section 12.3
4. Deploy

### 13.3 Verify CI/CD

After pushing, check:
- **GitHub Actions**: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Vercel Dashboard**: `https://vercel.com/YOUR_TEAM/YOUR_PROJECT`

---

## 14. Content Authoring Guide

### 14.1 Recommended Question Count

| Course Length | Questions | Chapters | Labs |
|---------------|-----------|----------|------|
| Short (1 week) | 50-100 | 3-5 | 5-10 |
| Medium (1 month) | 150-250 | 6-10 | 15-30 |
| Full cert prep | 250-500+ | 8-14 | 30-50+ |

### 14.2 Question Writing Best Practices

- **Stem**: Clear, unambiguous question (avoid "not" and double negatives)
- **Options**: 4 choices (A-D), plausible distractors, one clearly correct
- **Multi-select**: Use sparingly (10-15% of questions), mark answer as "AC" or "ABD"
- **Domains**: Tag every question with exactly one domain from your exam outline
- **Difficulty**: Label as easy/medium/hard (aim for 30/50/20 distribution)
- **Images**: Use for diagrams, charts, code screenshots, network topologies

### 14.3 Explanation Writing Best Practices

- Explain **why the correct answer is right** (not just "B is correct")
- Explain **why each wrong answer is wrong** (teaches by elimination)
- Include real-world context or exam tips where helpful
- Keep explanations under 200 words each

### 14.4 Lab Design Best Practices

| Lab Type | Best For | Example |
|----------|----------|---------|
| `click-match` | Vocabulary, term-definition pairs | Match AWS services to descriptions |
| `click-order` | Processes, sequences, procedures | Order incident response steps |
| `fill-blank` | Commands, syntax, specific values | Type the correct SQL query |
| `code-lab` | Hands-on coding, data analysis | Write Python to analyze a dataset |

### 14.5 Using the Question Importer

1. Start all 3 services: `docker compose up`
2. Log in as admin
3. Go to Admin > Question Bank > Import
4. Upload your PDF/DOCX
5. Wait for processing (progress shown in UI)
6. Review each extracted question:
   - Fix any OCR/parsing errors
   - Set difficulty and domain
   - Approve or reject
7. Click "Publish" to add approved questions to the bank
8. Click "Export JS" to generate updated `quiz_data.js`

---

## 15. Customization Checklist

Use this checklist when starting a new course:

### Must Change
- [ ] `package.json` — name, description
- [ ] `db/seeds.sql` — course title, exam code, vendor, chapter names
- [ ] `quiz_data.js` — all questions (your topic)
- [ ] `explanations.js` — all explanations (your topic)
- [ ] `labs.js` — all lab definitions (your topic)
- [ ] `question_images.js` — image mappings (if any)
- [ ] `quiz_images/` — actual image files (if any)
- [ ] `index.html` — title, branding, chapter names, topic lists, color scheme
- [ ] `.env.example` — CERT_PREFIX, app-specific defaults
- [ ] `README.md` — project description

### Should Change
- [ ] `server.js` — JWT issuer/audience strings (line ~250)
- [ ] `vercel.json` — buildCommand if you add/rename JS files
- [ ] `docker-compose.yml` — service names, image names
- [ ] `.github/workflows/ci.yml` — Docker image name prefixes
- [ ] `lab-orchestrator/lab-environments/` — Python packages for your domain
- [ ] `notebooks/` — Jupyter lab exercises for your chapters

### Keep As-Is (topic-agnostic)
- [ ] `middleware/security.js` — OWASP security (unchanged)
- [ ] `db/schema.sqlite.sql` — table structure (unchanged)
- [ ] `db/schema.qbank.sqlite.sql` — question bank tables (unchanged)
- [ ] `db-client.js` — browser sync client (unchanged)
- [ ] `question-importer/` — document parser (unchanged, unless unusual formatting)
- [ ] `lab-orchestrator/server.js` — container management (unchanged)
- [ ] `tests/server.test.js` — API tests (update passwords to meet 12-char policy)
- [ ] `.gitignore`, `.vercelignore` — exclusion rules (unchanged)

---

## 16. File Reference

### Files by Effort to Customize

**High effort (content creation):**
| File | Lines | What You Write |
|------|-------|----------------|
| `quiz_data.js` | 2,500+ | All exam questions |
| `explanations.js` | 1,300+ | All answer explanations |
| `index.html` | 6,781 | Branding, chapter content, flashcards |
| `labs.js` | 1,500+ | All lab exercises |

**Low effort (config changes):**
| File | Lines | What You Change |
|------|-------|-----------------|
| `db/seeds.sql` | ~50 | Course name, chapters, exam code |
| `package.json` | 40 | Name, description |
| `.env.example` | 20 | Prefix, ports |
| `vercel.json` | 50 | Build command |
| `docker-compose.yml` | 144 | Service names |

**Zero effort (copy as-is):**
| File | Lines | Why Unchanged |
|------|-------|---------------|
| `server.js` | 1,624 | All API logic is generic |
| `middleware/security.js` | 350+ | Security is topic-agnostic |
| `db-client.js` | 650 | Sync protocol is generic |
| `db/schema.*.sql` | 200+ | Table structure is generic |
| `question-importer/*` | 700+ | Parser is format-aware, not topic-aware |
| `lab-orchestrator/*` | 500+ | Container management is generic |
| `tests/*` | 716 | Tests are API-level, not content-level |
| `.github/workflows/ci.yml` | 100 | CI pipeline is generic |

---

## Quick Start Summary

```bash
# 1. Copy the SecAIPlus project
cp -r SecAIPlusStudyBuddy/ MyNewCourse/
cd MyNewCourse/

# 2. Update content files
#    - Edit quiz_data.js (your questions)
#    - Edit explanations.js (your explanations)
#    - Edit labs.js (your labs)
#    - Add images to quiz_images/ and update question_images.js
#    - Edit index.html (branding, chapters, flashcards)

# 3. Update config
#    - Edit db/seeds.sql (course title, chapters)
#    - Edit package.json (name, description)
#    - Copy .env.example to .env (set secrets)

# 4. Bootstrap
npm install
npm run db:init
npm run db:seed

# 5. Run
npm run dev        # API on :3001
# Open index.html in browser (or serve via Vercel)

# 6. Deploy
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOU/YOUR_REPO.git
git push -u origin main
# Connect to Vercel for frontend hosting
```
