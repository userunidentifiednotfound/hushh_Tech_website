## Summary

- **what changed:** Added `api/shared/errorResponse.js` with `sendSafeError` and `sendUpstreamError` helpers. Patched `enrich-preferences.js` to stop forwarding raw OpenAI error bodies to callers. Patched `generate-investor-profile.js` to stop forwarding `error.message` verbatim in 500 responses. Every error is now logged server-side with a `correlationId` (UUID) and only a safe, opaque message is returned to the client.
- **why it changed:** `enrich-preferences.js` was returning `{ error: "OpenAI request failed", detail: <raw upstream body> }` — upstream error bodies from OpenAI can contain API key hints, model names, and quota details that should not be visible to callers. `generate-investor-profile.js` was returning `error.message` directly, which could expose internal stack details or configuration errors. This violates the best_practices.md rule: "API routes should validate inputs, fail closed on missing secrets, and avoid leaking internal errors."
- **linked issue:** none — identified during security audit of API error paths
- **acceptance criteria covered:** Raw OpenAI error bodies are never forwarded to clients. `error.message` from caught exceptions is never forwarded. Every error response includes a `correlationId` for server-side tracing. 9 tests verify no secret leakage.
- **risk area touched:** `api`, `security`
- **reviewer focus:** Confirm that `sendSafeError` and `sendUpstreamError` in `errorResponse.js` never include the raw `error` argument in the JSON response body. Check that `correlationId` appears in Cloud Run logs for traceability.

## Validation

- [x] `npm test` — 9 new tests in `tests/errorResponse.test.js` all pass
- [x] `npx tsc --noEmit` — no type errors
- [x] `npm run lint:ci` — no lint violations
- [x] `npm run security:gitleaks` — no secrets detected
- [x] Manually verified response body does not contain raw error strings
- [ ] `npm run build:web` — not run (no frontend changes)
- [ ] `npm run smoke:ci` — not run locally
- **ran:** `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`
- **did not run:** `npm run build:web` (no frontend changes), `npm run smoke:ci` (requires deploy)
- **reviewer should verify:** Open `api/shared/errorResponse.js` and confirm the `error` parameter is only passed to `console.error`, never serialised into the response JSON.

## Notes

- **deployment impact:** None — error response shape changes from `{ error: <raw message> }` to `{ error: <safe message>, correlationId: <uuid> }`. Clients that were parsing the raw error string will now receive a generic message. No auth or data paths affected.
- **migration or env requirements:** None.
- **rollback or release notes:** Revert by removing the `errorResponse.js` import and restoring the original catch blocks. No data migration needed.
- **follow-up work:** Wire `correlationId` into a Cloud Run structured log field so errors can be searched by ID in Cloud Logging.
- **reviewer callouts:** `@ankitkumarsingh1702` — please confirm the safe message strings in `SAFE_UPSTREAM_MESSAGES` are appropriate for end users.
