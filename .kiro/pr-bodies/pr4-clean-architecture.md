## Summary

- what changed: Scaffolded the full clean-architecture layer structure for `src/hushh-intelligence/` following the rules in `.cursor/rules/clean-architecture-rules.mdc`. Added Core layer (`core/types/index.ts`, `core/errors/index.ts`) with pure TypeScript types and custom domain errors (`ValidationError`, `UnauthorizedError`, `StorageError`). Added Domain layer with four repository interfaces and six single-responsibility use cases. Fixed `CheckMediaUploadUseCase` to call `ensureExists` for first-time users instead of incorrectly returning false. All use cases now throw typed domain errors instead of generic `Error`.
- why it changed: The existing `src/hushh-intelligence/services/intelligenceService.ts` was a 400-line flat file mixing Supabase calls, auth checks, business logic, and mapper functions in a single module. This violated the clean-architecture dependency rule documented in `.cursor/rules/clean-architecture-rules.mdc`. The domain layer had no repository interfaces, making it impossible to unit-test business logic without a live Supabase connection.
- linked issue: none — architectural compliance refactor with no corresponding feature ticket; the clean-architecture rules are defined in `.cursor/rules/clean-architecture-rules.mdc`
- acceptance criteria covered: Domain layer has zero React imports. Domain layer has zero Supabase imports. Each use case has a single `execute()` method. Repository interfaces are in `domain/repositories/`. First-time users are not blocked by missing limits records. All validation throws `ValidationError` (typed domain error). 19 unit tests run with in-memory mocks and no external dependencies.
- risk area touched: api
- reviewer focus: Verify no files in `src/hushh-intelligence/domain/` or `src/hushh-intelligence/core/` import from `react` or `@supabase/supabase-js`. Confirm `CheckMediaUploadUseCase` calls `ensureExists` before returning false for missing limits. Confirm `ValidationError` and `UnauthorizedError` are subclasses of `IntelligenceError`.
- `CheckMediaUploadUseCase` now calls `ensureExists` when `getLimits` returns null, then retries — first-time users get a fresh limits record instead of a false denial.
- All input validation in use cases throws `ValidationError` (a typed `IntelligenceError` subclass) instead of generic `Error`, enabling callers to distinguish domain validation failures from unexpected errors.

## Validation

- [x] `npm test` — 19 new tests in `tests/intelligenceDomain.test.ts` all pass with zero external dependencies
- [x] `npx tsc --noEmit` — no type errors
- [x] `npm run lint:ci` — no lint violations on governed surfaces
- [x] `npm run security:gitleaks` — no secrets detected in diff
- [x] `npm run security:audit` — no new vulnerabilities introduced above baseline
- [x] `npm run env:check` — no new environment variables required
- [ ] `npm run build:web` — not run, new files are not yet imported by the app bundle
- [ ] `npm run smoke:ci` — not run locally, requires deployed environment
- ran: `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`, `npm run security:audit`, `npm run env:check`
- did not run: `npm run build:web` (new files not yet imported by app), `npm run smoke:ci` (requires deploy)
- reviewer should verify: Open any file in `src/hushh-intelligence/domain/` and confirm no imports from `react` or `@supabase/supabase-js`. Run `npm test tests/intelligenceDomain.test.ts` to confirm 19 tests pass without a Supabase connection.

## Notes

- deployment impact: None — new files are not yet imported by the running application. This PR establishes the architecture; a follow-up PR will wire the data layer (Supabase implementations) and presentation layer (ViewModel hook).
- migration or env requirements: No new environment variables. No schema changes.
- rollback or release notes: Safe to revert — no existing code is modified. Only new files are added.
- follow-up work if any: Add `data/repositories/` Supabase implementations (`UserRepositoryImpl`, `ConversationRepositoryImpl`, etc.) and the `di/IntelligenceContainer.ts` DI container in a follow-up PR.
- reviewer callouts or codeowners you expect to review this: `@ankitkumarsingh1702` — key things to verify are the import discipline in domain layer files and the `CheckMediaUploadUseCase` first-time user fix.
