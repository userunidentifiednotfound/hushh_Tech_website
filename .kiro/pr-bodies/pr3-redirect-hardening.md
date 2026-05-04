## Summary

- **what changed:** Hardened `sanitizeInternalRedirect` in `src/utils/security.ts` to block encoded newlines (`%0a`, `%0d`) and null bytes (`%00`) in redirect paths, added a 2048-character length cap, and reconstructs the path from the parsed URL to normalise any encoded sequences before returning.
- **why it changed:** The previous implementation only checked that the path started with `/` and parsed cleanly as a URL. It did not block percent-encoded control characters. A path like `/profile%0aSet-Cookie:evil=1` passes the old check but can be used for HTTP response splitting in some proxy or logging configurations. The 2048-char cap prevents log-flooding. This function is used in the OAuth redirect flow (`buildOAuthRedirectTo`, `buildLoginRedirectPath`) making it a high-value hardening target.
- **linked issue:** none — identified during security review of the OAuth redirect path
- **acceptance criteria covered:** Paths with `%0a`, `%0d`, `%00` (any case) are rejected and fall back to the default. Paths over 2048 chars are rejected. External URLs, protocol-relative URLs, and `javascript:` URIs continue to be rejected. Valid internal paths pass through unchanged.
- **risk area touched:** `auth`, `security`
- **reviewer focus:** Review the regex `/%(00|0a|0d)/i` in `sanitizeInternalRedirect` and confirm it covers the known header-injection vectors. Verify the 2048-char limit does not break any legitimate deep-link redirect paths in the app.

## Validation

- [x] `npm test` — 17 new tests in `tests/securityUtils.test.ts` all pass
- [x] `npx tsc --noEmit` — no type errors
- [x] `npm run lint:ci` — no lint violations
- [x] `npm run security:gitleaks` — no secrets detected
- [x] Manually tested encoded newline bypass vector against the new implementation
- [ ] `npm run build:web` — not run (utility function, no UI changes)
- [ ] `npm run smoke:ci` — not run locally
- **ran:** `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`
- **did not run:** `npm run build:web` (no UI changes), `npm run smoke:ci` (requires deploy)
- **reviewer should verify:** Confirm no existing OAuth redirect test cases break. Check that the longest legitimate redirect path in the app is under 2048 characters.

## Notes

- **deployment impact:** None — this is a pure input-validation tightening. Legitimate redirect paths are unaffected. Only malformed paths with encoded control characters or extreme length are now rejected.
- **migration or env requirements:** None.
- **rollback or release notes:** Revert by restoring the previous `sanitizeInternalRedirect` implementation. No data migration needed.
- **follow-up work:** Consider adding a CSP `navigate-to` directive as a defence-in-depth complement to this server-side check.
- **reviewer callouts:** `@ankitkumarsingh1702` — this touches the OAuth redirect path used by both Google and Apple sign-in. Please verify the 17 test cases cover your expected redirect scenarios.
