# SecAIPlus

CompTIA SecAI+ (CY0-001) certification exam prep — single-page application with an Express/SQLite API backend.

## Two applications (do not confuse them)

| What | Command | Default URL | Role |
|------|---------|-------------|------|
| **Main study app** (API + classic UI) | `npm run dev` or `npm run lms:dev` | http://localhost:3001 | **Source of truth** for the shipped experience: Express serves the API and static assets under `content/study-spa/`. This is the app described throughout most of this repo. |
| **Optional Next.js frontend** | `npm run web:dev` | http://localhost:3000 | Separate TypeScript app in [`webapp/`](webapp/). Same course content in places, but **it does not replace** the study SPA or the LMS server. Use it only when you intend to work on that experimental/alternate UI. |

Production static deploys (e.g. Vercel config in this repo) target **`content/study-spa/`**, not the Next app, unless you configure a different project yourself.

## Features

- **8-chapter workspace** — topics, scenarios, labs, flashcards, chapter quiz, and summary per chapter
- **Adaptive flashcards** — spaced-repetition drill with confidence tracking
- **260+ practice questions** — timed quiz mode with detailed explanations and image support
- **Hands-on labs** — browser-based lab simulations via Docker containers
- **Progress dashboard** — per-chapter scores, streaks, and weak-area analysis
- **Question importer** — bulk-import questions from CSV/PDF/DOCX via microservice

## Quick Start

```bash
# 1. Clone
git clone https://github.com/<your-username>/SecAIPlus.git
cd SecAIPlus

# 2. Install
npm install

# 3. Configure
cp .env.example .env        # edit values as needed

# 4. Initialize the database
npm run db:init
npm run db:seed

# 5. Run the main app (LMS + API)
npm run dev                  # or: npm run lms:dev  →  http://localhost:3001
```

Open `content/study-spa/index.html` directly in a browser for the offline/frontend-only experience (no server required for study content).

### Troubleshooting: `better_sqlite3.node: invalid ELF header` (WSL / mixed OS)

`better-sqlite3` is a **native** addon: the `.node` file must match the OS and CPU of the **Node** process that loads it.

- If the repo lives on a **Windows drive** (e.g. `H:\…` → `/mnt/h/…` in WSL) and you ran **`npm install` in Windows**, the binary is built for Windows. Running **`npm run dev` inside WSL** then loads that folder with **Linux** Node → Linux expects an ELF binary and fails with **invalid ELF header**.
- **Fix (pick one):**
  1. **Use WSL for both install and run:** in a WSL shell, from the project directory run `rm -rf node_modules && npm install`, then `npm run dev`. Build tools may be required: `sudo apt install -y build-essential python3`.
  2. **Use Windows for both:** open the project in **PowerShell or CMD** (not WSL), run `npm install` and `npm run dev` there.
  3. **Quick rebuild in the same environment as `node`:** after switching OS, run `npm rebuild better-sqlite3` (or a full `rm -rf node_modules && npm install`).

Do not mix “install on Windows, run server in WSL” (or the reverse) without reinstalling `node_modules` in the environment you use to start `server.js`.

## Optional Next.js webapp (`webapp/`)

A Next.js + TypeScript app lives in [`webapp/`](webapp/). It is **optional** and runs **only** when you start it explicitly. It does **not** start the Express LMS or change how `npm run dev` behaves.

```bash
# From the repo root — separate terminal, separate port
npm run web:dev              # → http://localhost:3000
```

Backup and rollout notes: [docs/WEBAPP_MIGRATION_BACKUP_PLAN.md](docs/WEBAPP_MIGRATION_BACKUP_PLAN.md).

## Project Structure

```
├── server.js               # Express API server
├── content/
│   ├── study-spa/          # Offline SPA + companion study assets
│   ├── notebooks/          # Jupyter lab notebooks (ch2–ch8)
│   └── question-bank/      # JSON quiz bank (study-spa + optional Next webapp)
├── db/
│   ├── schema.sqlite.sql   # SQLite schema
│   ├── schema.pg.sql       # PostgreSQL schema
│   ├── schema.qbank.*.sql  # Question-bank tables
│   └── seeds.sql           # Seed data
├── lab-orchestrator/       # Docker lab container manager
├── question-importer/      # Bulk question import service
├── webapp/                 # Next.js + TypeScript study webapp
├── scripts/                # check-question-sync.js; optional Python extract/rollback helpers
├── tests/                  # Node.js test suite
├── docs/                   # Design docs & templates
└── docker-compose.yml      # Full-stack Docker setup
```

## Docker (full stack)

```bash
docker compose up --build
```

Starts the LMS server, lab orchestrator, and question importer on ports 3001–3003.

## Testing

```bash
npm test
```

## Continuous integration (GitHub)

- **[`.github/workflows/ci.yml`](.github/workflows/ci.yml)** — on push and pull requests to `main`: Node 20/22 LMS tests, DB init/seed, question-bank sync check, optional **`webapp/`** typecheck, Vitest, production build, and Playwright (Chromium). On pushes to `main`, Docker images are built from `Dockerfile.lms`, `lab-orchestrator/`, and `question-importer/`.
- **[`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml)** — Vercel preview deploy + Playwright against the preview URL on pull requests (skips forks); production deploy on `main`. Requires repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Dependency updates: [`.github/dependabot.yml`](.github/dependabot.yml) (root, `webapp/`, `lab-orchestrator/`, `question-importer/`, GitHub Actions).

## License

MIT
