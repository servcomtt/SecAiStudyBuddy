# Webapp Rollout Backup Plan

## Goal

Convert the current SecAIPlus study site from a large single-file SPA into a typed web application without losing the working study experience, question bank, or lab/API integrations.

## Current Baseline

- Offline frontend: [index.html](../content/study-spa/index.html)
- API server: [server.js](../server.js)
- Local database: [db/studybuddy.db](../db/studybuddy.db)
- Quiz bank: [questions.json](../content/question-bank/questions.json), [quiz_data.js](../content/study-spa/quiz_data.js), [explanations.js](../content/study-spa/explanations.js), [question_images.js](../content/study-spa/question_images.js)
- Labs and microservices: [lab-orchestrator/server.js](../lab-orchestrator/server.js), [question-importer/server.js](../question-importer/server.js)

## Backup Strategy

### 1. Keep the offline app deployable during rollout

- Do not replace the offline SPA until the new app covers the same workflows.
- Build the new web app in a separate folder: [webapp/](../webapp)
- Keep [index.html](../content/study-spa/index.html) as the fallback and source-of-truth reference while routes are migrated.

### 2. Create a checkpoint before every rollout slice

- Commit before each major phase.
- Suggested naming:
  - `backup/pre-webapp-scaffold`
  - `backup/dashboard-migrated`
  - `backup/practice-routes-migrated`

### 3. Preserve data separately from UI work

- SQLite backup:
  - copy [db/studybuddy.db](../db/studybuddy.db) to a dated backup before schema changes
- PostgreSQL backup:
  - use `pg_dump` before changing any production schema
- Question bank backup:
  - copy [questions.json](../content/question-bank/questions.json)
  - copy [explanations.js](../content/study-spa/explanations.js)
  - copy [question_images.js](../content/study-spa/question_images.js)

### 4. Preserve deployment configuration

- Keep [vercel.json](../vercel.json) unchanged until the new app is ready to build and serve.
- Keep current Express routes untouched during frontend scaffolding.

## Rollback Plan

If a rollout slice fails:

1. Stop using the new route or app entry point.
2. Point deployment back to the offline SPA build.
3. Restore the last checkpoint commit.
4. Restore DB snapshot only if a schema or seed change was part of that slice.

## Migration Phases

### Phase 1. Parallel scaffold

- Create the typed web app in [webapp/](../webapp)
- Recreate shell navigation and route structure
- Read shared course content from existing source files where possible

### Phase 2. Read-only pages

- Dashboard
- Domains/topics overview
- Chapter landing pages
- Practice overview

### Phase 3. Interactive study flows

- Progress state
- Notes
- Flashcards
- Chapter quiz flow

### Phase 4. Server integration

- Auth
- Progress sync
- Question bank admin
- Lab orchestration hooks

### Phase 5. Cutover

- Switch deployment from the offline SPA to the new app
- Keep the offline SPA available behind a temporary fallback route until production is stable

## First Slice Started In This Commit

- Added a new typed web app scaffold in [webapp/](../webapp)
- Left the offline SPA intact
- Reused the existing quiz bank as source data for the new dashboard/domains pages
