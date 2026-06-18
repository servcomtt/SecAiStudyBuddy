## Webapp Deployment Boundary

The Next.js webapp in `/webapp` is not fully self-contained yet, but the shared offline study source files it depends on live under `/content`.

## Cutover To The Next Webapp

To make production serve the Next.js app instead of the offline SPA:

1. In the Vercel project settings, change the project **Root Directory** to `/webapp`
2. Keep `/content` available in the repository because the current webapp still reads chapter content from it at build/runtime
3. Deploy again after the root-directory change

Important: the old root-level `/vercel.json` is the offline SPA deploy config. Once the Vercel project root is `/webapp`, the Next app's own config in `/webapp/next.config.ts` becomes the active deploy behavior.

Current runtime/build inputs that must stay available in CI/CD:

- `/webapp`
- `/content/question-bank/questions.json`
- `/content/study-spa/index.html`
- `/content/study-spa/labs.js`
- `/content/notebooks/`

These content files are still read by the webapp:

- `/webapp/lib/quiz-bank.ts` reads `/content/question-bank/questions.json`
- `/webapp/lib/chapter-study-bank.ts` reads `/content/study-spa/index.html`
- `/webapp/lib/chapter-lab-bank.ts` reads `/content/study-spa/labs.js`
- `/webapp/app/notebooks/[filename]/route.ts` serves `/content/notebooks/`

Files that are not required for the webapp deployment and should be excluded from CI/CD upload context:

- backend and local runtime files such as `/server.js`, `/db-client.js`, `/middleware/`, `/db/`, `/uploads/`
- importer/orchestrator services such as `/question-importer/` and `/lab-orchestrator/`
- offline SPA assets that the webapp does not consume directly, including `/content/study-spa/quiz_images/`, `/content/study-spa/explanations.js`, `/content/study-spa/quiz_data.js`, `/content/study-spa/question_images.js`, and `/content/study-spa/db-client.js`
- local/test-only content such as `/tests/`, `/scripts/`, `/materials/`, and `/docs/`

The tracked `/webapp/tsconfig.tsbuildinfo` file was removed because it is a local TypeScript cache artifact, not a deployable input.
