# PR 1378 Visual Proof

Route: `/metrics`

Proof captured with Playwright against a local Vite dev server using the mocked metrics summary payload from `tests/metricsStatusBadgesVisual.spec.ts`.

Validation:

```bash
npx.cmd playwright test tests/metricsStatusBadgesVisual.spec.ts
```

Screenshots:

- `metrics-status-badges-mobile.png` - mobile `/metrics` layout with centered named status badges.
- `metrics-status-badges-desktop.png` - desktop `/metrics` layout with centered named status badges.
