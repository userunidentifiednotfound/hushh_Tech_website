## Summary

- **what changed:** Scaffolded the full clean-architecture layer structure for `src/hushh-intelligence/` following the rules in `.cursor/rules/clean-architecture-rules.mdc`. Added: Core layer (`core/types/index.ts`, `core/errors/index.ts`) with pure TypeScript types and custom errors. Domain layer with four repository interfaces (`IUserRepository`, `IConversationRepository`, `IMessageRepository`, `IMediaLimitsRepository`) and six single-responsibility use cases (`GetOrCreateUserUseCase`, `GetConversationsUseCase`, `CreateConversationUseCase`, `AddMessageUseCase`, `GetMessagesUseCase`, `CheckMediaUploadUseCase`).
- **why it changed:** The existing `src/hushh-intelligence/services/intelligenceService.ts` was a 400-line flat file mixing Supabase calls, auth checks, business logic, and mapper functions in a single module. This violated the clean-architecture dependency rule (`Core → Domain → Data → Presentation`) documented in `.cursor/rules/clean-architecture-rules.mdc`. The domain layer had no repository interfaces, making it impossible to unit-test business logic without a live Supabase connection.
- **linked issue:** none — architectural compliance with `.cursor/rules/clean-architecture-rules.mdc`
- **acceptance criteria covered:** Domain layer has zero React imports. Domain layer has zero Supabase imports. Each use case has a single `execute()` method with one responsibility. Repository interfaces are in `domain/repositories/`. 15 unit tests run with in-memory mocks and no external dependencies.
- **risk area touched:** `ui`, `api`
- **reviewer focus:** Verify that none of the new files in `src/hushh-intelligence/domain/` or `src/hushh-intelligence/core/` import from `react`, `@supabase/supabase-js`, or any other external library. Check that each use case class has exactly one public method.

## Validation

- [x] `npm test` — 15 new tests in `tests/intelligenceDomain.test.ts` all pass with zero external dependencies
- [x] `npx tsc --noEmit` — no type errors
- [x] `npm run lint:ci` — no lint violations
- [x] `npm run security:gitleaks` — no secrets detected
- [x] Verified domain layer files contain no React or Supabase imports
- [ ] `npm run build:web` — not run (new files are not yet wired into the app bundle)
- [ ] `npm run smoke:ci` — not run locally
- **ran:** `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`
- **did not run:** `npm run build:web` (new files not yet imported by app), `npm run smoke:ci` (requires deploy)
- **reviewer should verify:** Open any file in `src/hushh-intelligence/domain/` and confirm there are no imports from `react` or `@supabase/supabase-js`. Run `npm test tests/intelligenceDomain.test.ts` to confirm all 15 tests pass without a Supabase connection.

## Notes

- **deployment impact:** None — new files are not yet imported by the running application. This PR establishes the architecture; a follow-up PR will wire the data layer (Supabase implementations) and presentation layer (ViewModel hook).
- **migration or env requirements:** None.
- **rollback or release notes:** Safe to revert — no existing code is modified. Only new files are added.
- **follow-up work:** Add `data/repositories/` Supabase implementations (`UserRepositoryImpl`, `ConversationRepositoryImpl`, etc.) and the `di/IntelligenceContainer.ts` DI container in a follow-up PR.
- **reviewer callouts:** `@ankitkumarsingh1702` — this is a structural PR. The key thing to verify is the import discipline in the domain layer files.
