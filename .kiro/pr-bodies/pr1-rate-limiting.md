## Summary

- what changed: Added `api/shared/rateLimiter.js` with a sliding-window in-process rate limiter and strict CORS origin allowlist. Applied rate limiting to `send-email-notification` (10 req/min) and `generate-investor-profile` (5 req/min). Replaced `Access-Control-Allow-Origin: *` on `generate-investor-profile` with an explicit allowlist covering `hushhtech.com` and `www.hushhtech.com`.
- why it changed: Both endpoints had no rate limiting and used wildcard CORS. The email endpoint could be abused to send unlimited spam at zero cost to the attacker. The profile-generation endpoint calls OpenAI GPT-4o which costs money per call — an open endpoint with no limits is a denial-of-wallet risk. Wildcard CORS allows any origin to make credentialed cross-origin POST requests.
- linked issue: none — proactive security hardening of unauthenticated API surfaces, no open issue exists for this
- acceptance criteria covered: Rate limiter returns 429 with Retry-After header when limit exceeded. CORS rejects POST from unlisted origins with 403. Allowed origins pass through correctly. 16 tests cover all branches.
- risk area touched: api, security
- reviewer focus: Verify the ALLOWED_ORIGINS set in rateLimiter.js includes all legitimate production origins. Confirm 429 response includes Retry-After header. Note the in-process store limitation documented in Notes.
- The in-process Map store is not shared across Cloud Run instances — this is a known limitation documented in the file and tracked as follow-up work. For single-instance Cloud Run deployments this provides meaningful protection.
- Rate limit values chosen conservatively: 10/min for email (human-initiated), 5/min for AI profile generation (expensive upstream call).

## Validation

- [x] `npm test` — 309 tests pass, 0 failures (includes 16 new rateLimiter tests)
- [x] `npx tsc --noEmit` — no type errors introduced
- [x] `npm run lint:ci` — no lint violations on governed surfaces
- [x] `npm run security:gitleaks` — no secrets detected in diff
- [x] `npm run security:audit` — no new vulnerabilities introduced above baseline
- [x] `npm run env:check` — no new environment variables required
- [ ] `npm run build:web` — not run locally, no frontend changes in this PR
- [ ] `npm run smoke:ci` — not run locally, requires deployed environment
- ran: `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`, `npm run security:audit`, `npm run env:check`
- did not run: `npm run build:web` (no frontend changes), `npm run smoke:ci` (requires deploy)
- reviewer should verify: ALLOWED_ORIGINS in rateLimiter.js matches all production and staging domains. Confirm 429 includes Retry-After header. Run `npm test tests/rateLimiter.test.js` to confirm 16 tests pass.

## Notes

- deployment impact: None — middleware is purely additive. Existing requests from hushhtech.com are unaffected. The 429 response is new behaviour only for callers exceeding the limit.
- migration or env requirements: No new environment variables required. No schema changes.
- rollback or release notes: Revert by removing the rateLimiter.js import lines from the two API files. No data migration needed.
- follow-up work if any: Replace the in-process Map store with a Redis or Upstash distributed store for multi-instance Cloud Run deployments. This is documented as a known limitation in the rateLimiter.js JSDoc.
- reviewer callouts or codeowners you expect to review this: `@ankitkumarsingh1702` — please verify the CORS origin list and confirm rate limit values are appropriate for expected production traffic volumes.
