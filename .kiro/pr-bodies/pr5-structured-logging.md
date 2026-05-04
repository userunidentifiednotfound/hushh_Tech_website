## Summary

- **what changed:** Added `api/shared/requestLogger.js` with a `requestLoggerMiddleware` Express middleware and a `logEvent` helper. Wired the middleware into `server.js` after body parsing. Replaced the `console.log` startup message with a structured `logEvent` call. Every request now emits a JSON log line with `httpRequest` fields that Google Cloud Logging parses natively (method, path, status, latency, remoteIp, userAgent). Sensitive headers (`Authorization`, `Cookie`, `Set-Cookie`) are redacted before logging.
- **why it changed:** The Cloud Run server had no per-request logging. Debugging production issues required guessing from application-level logs. Cloud Logging can parse structured `httpRequest` JSON fields into a dedicated request log view with latency histograms and status-code filtering — but only if the server emits the correct format. The `console.log` startup message was also unstructured and would not be indexed correctly.
- **linked issue:** none — observability improvement for Cloud Run production environment
- **acceptance criteria covered:** Every request produces a JSON log line. `Authorization` and `Cookie` headers are replaced with `[REDACTED]`. `Set-Cookie` response headers are replaced with `[REDACTED]`. Severity maps correctly (INFO/WARNING/ERROR) to HTTP status ranges. `correlationId` is attached to `req` for downstream handlers.
- **risk area touched:** `infra`, `api`
- **reviewer focus:** Verify that `sanitiseHeaders` in `requestLogger.js` covers all sensitive header names. Confirm that response bodies are never logged (only headers and status). Check that the middleware is registered before route handlers in `server.js`.

## Validation

- [x] `npm test` — 12 new tests in `tests/requestLogger.test.js` all pass
- [x] `npx tsc --noEmit` — no type errors
- [x] `npm run lint:ci` — no lint violations
- [x] `npm run security:gitleaks` — no secrets detected
- [x] Verified `Authorization` and `Cookie` values do not appear in log output
- [ ] `npm run build:web` — not run (no frontend changes)
- [ ] `npm run smoke:ci` — not run locally
- **ran:** `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`
- **did not run:** `npm run build:web` (no frontend changes), `npm run smoke:ci` (requires deploy)
- **reviewer should verify:** Confirm `REDACTED_REQUEST_HEADERS` set in `requestLogger.js` includes `authorization` and `cookie`. Confirm response bodies are not referenced anywhere in the logger. Verify middleware order in `server.js` (logger must come before route handlers).

## Notes

- **deployment impact:** Adds structured JSON lines to Cloud Run stdout. Cloud Logging will automatically parse `httpRequest` fields. No breaking changes to existing log consumers.
- **migration or env requirements:** None — no new environment variables.
- **rollback or release notes:** Revert by removing the `requestLoggerMiddleware` import and `app.use(requestLoggerMiddleware)` line from `server.js`. No data migration needed.
- **follow-up work:** Add `correlationId` propagation to Supabase client calls so a single request's full trace can be reconstructed across log lines.
- **reviewer callouts:** `@ankitkumarsingh1702` — please confirm the `httpRequest` JSON structure matches what your Cloud Logging dashboard expects for the request log view.
