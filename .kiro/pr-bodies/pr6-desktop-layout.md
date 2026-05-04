## Summary

- what changed: Made `src/pages/home/ui.tsx` and `src/components/Hero.tsx` responsive for desktop. Replaced the hardcoded `max-w-md` (448px) and `maxW="393px"` (iPhone width) containers with a `max-w-6xl` responsive layout. Desktop (1024px+) now shows a two-column hero with headline and CTAs on the left and feature cards on the right. The Hushh Advantage grid expands from 2-col to 4-col. The Feature grid expands from 2-col to 4-col. CTA buttons go side-by-side on sm+. Fund A card is constrained to 640px on desktop. Mobile layout is completely unchanged.
- why it changed: The home page was designed with a mobile-first `max-w-md` container that never expanded on desktop, leaving the content as a narrow column in the centre of a wide screen. On a 1440px monitor the content occupied roughly 30% of the viewport width, wasting the remaining 70%. The layout needed to use the available desktop space without changing the visual theme.
- linked issue: none — UI layout improvement identified from visual inspection on desktop viewport, no open issue exists for this
- acceptance criteria covered: On desktop (1024px+) the hero section is two-column. The Hushh Advantage and Feature grids are 4-column. CTA buttons are inline. Mobile layout (below 768px) is pixel-identical to before. All fonts, colors, icons, border-radius, and shadows are unchanged.
- risk area touched: ui
- reviewer focus: Verify the mobile layout is unchanged by resizing below 768px. Confirm no Tailwind classes change colors, fonts, or icon names. Check that the `lg:hidden` and `hidden lg:grid` guards correctly show/hide the right column on each breakpoint.
- The right column on desktop (AI-Powered / Human-Led cards + trust strip) is hidden on mobile using `hidden lg:grid` and the mobile-only versions use `lg:hidden` — no content is lost at any breakpoint.
- All responsive changes use Tailwind breakpoint prefixes (`lg:`, `sm:`) and Chakra UI responsive arrays — no media query overrides or inline styles were added.

## Validation

- [x] `npm test` — 293 tests pass, 0 failures
- [x] `npx tsc --noEmit` — no type errors introduced
- [x] `npm run lint:ci` — no lint violations on governed surfaces
- [x] `npm run security:gitleaks` — no secrets detected in diff
- [x] `npm run security:audit` — no new vulnerabilities introduced above baseline
- [x] `npm run env:check` — no new environment variables required
- [ ] `npm run build:web` — not run locally (UI-only change, no build-breaking imports)
- [ ] `npm run smoke:ci` — not run locally, requires deployed environment
- ran: `npm test`, `npx tsc --noEmit`, `npm run lint:ci`, `npm run security:gitleaks`, `npm run security:audit`, `npm run env:check`
- did not run: `npm run build:web` (UI layout change only, no new imports), `npm run smoke:ci` (requires deploy)
- reviewer should verify: Resize browser to 1280px and confirm two-column hero layout. Resize to 375px and confirm single-column mobile layout is unchanged. Run `npm test` to confirm 293 tests pass.

## Notes

- deployment impact: None — pure CSS/layout change. No API routes, auth paths, or data contracts touched.
- migration or env requirements: No new environment variables. No schema changes.
- rollback or release notes: Revert by restoring the original `max-w-md` and `maxW="393px"` values. No data migration needed.
- follow-up work if any: Apply the same responsive treatment to other pages that use `max-w-md` single-column layouts (profile page, onboarding steps) in follow-up PRs.
- reviewer callouts or codeowners you expect to review this: `@ankitkumarsingh1702` — please verify the mobile layout is unchanged and the desktop two-column hero looks correct at 1280px and 1440px viewports.
