## Performance Testing

Phase-one performance checks are intentionally lightweight and easy to run during local development or CI smoke tests.

### What we measure

- Page load speed
  - `/dashboard`
  - `/domains`
  - `/chapters/ch2/topics`
  - `/ai`
- API response time
  - `GET /api/chat`
- AI response start time
  - `POST /api/chat` with `stream: true`
  - measured as time to first response byte
- DB query timing
  - representative SQLite reads against the production schema

### Phase-one targets

- Main pages load quickly on broadband
  - target: under `2500ms`
- Normal API routes respond in under a few seconds
  - target: under `3000ms`
- AI feature gives visible feedback immediately
  - target: first AI response byte under `800ms`
- DB queries stay comfortably sub-second
  - target: p95 under `150ms`

### Run it

From the repo root:

```bash
npm run perf:smoke
```

Optional environment overrides:

```bash
PERF_WEB_BASE_URL=http://127.0.0.1:3002 npm run perf:smoke
PERF_TARGET_PAGE_MS=2000 PERF_STRICT=1 npm run perf:smoke
```

### Notes

- The smoke test uses HTTP timing for phase-one page checks. It is a practical early proxy, not a full browser Lighthouse run.
- `GET /api/chat` now returns `Server-Timing` headers for the Ollama health probe and total route time.
- Streaming AI requests return an acknowledgement immediately so the UI can show progress even when the model takes longer to answer.
- If Ollama is offline, the AI route still reports health and the streaming request still measures the start of the response path.
