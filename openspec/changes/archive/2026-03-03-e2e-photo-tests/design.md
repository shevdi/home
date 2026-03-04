## Context

`photos.spec.ts` has 10 empty test stubs organized into "unauthenticated user" and "authenticated user" groups. The infrastructure is already in place: `seedPhotos`/`resetPhotos` helpers hit `/__test/` endpoints to control data, `loginAsAdmin` performs browser-based login, and `mockPhotos` provides 7 photos with varying properties (private/public, with/without tags, with/without GPS, different dates). The mock server handles external API calls (Drime file storage, geocoding).

## Goals / Non-Goals

**Goals:**
- Implement all 10 existing test stubs with real Playwright interactions and assertions
- Add edge-case tests for search/filter (tags, date range, country/city), photo navigation (prev/next), empty state, private badge visibility, and full-size link
- Tests should be deterministic via seeded data and run against the e2e Docker Compose stack

**Non-Goals:**
- Upload flow testing with real file I/O (upload involves multipart + server-side sharp processing; defer to a separate change)
- Performance or load testing
- Visual regression / screenshot comparison
- Testing infinite scroll pagination (requires more than 7 seeded photos and timing-sensitive scroll behavior)

## Decisions

### Test data strategy: use existing mockPhotos fixture, extend only if needed

The 7 mock photos cover: private (3) vs public (4), with tags (3) vs without, with GPS (4) vs without, with title (1) vs empty, featured priority (1). This is sufficient for most assertions. If a test needs a specific combination not present, add a targeted entry to `mockPhotos` rather than creating separate fixtures.

Alternative considered: separate fixture files per test. Rejected because seedPhotos replaces all data each time, so a single shared dataset is simpler and the 7 photos cover enough permutations.

### Authentication approach: `loginAsAdmin` for authenticated tests, no login for unauthenticated

The `loginAsAdmin` helper navigates to `/login`, fills credentials, and submits. Authenticated tests call this in a nested `beforeEach`. Unauthenticated tests navigate directly to `/photos`.

Alternative considered: API-based auth via cookies/tokens injected into browser context. Rejected because `loginAsAdmin` is already proven in `auth.spec.ts` and keeps tests realistic.

### Assertion strategy: prefer accessible selectors and visible text

Use `getByRole`, `getByText`, `getByLabel` over CSS class selectors. For photo cards in the gallery, use `img[alt]` or link `href` patterns since photo cards don't have semantic roles beyond links. For the private badge, assert `[aria-label="Private photo"]` which is already on the component.

### Upload test: skip implementation for now

Upload requires file input interaction, multipart processing through mock Drime server, and server-side sharp image processing. The mock server's `/uploads` endpoint exists but the real server's `/upload` route does heavy processing. This is better addressed in a dedicated change.

## Risks / Trade-offs

- **Placeholder image URLs**: Mock photos use `http://placeholder/*` URLs that won't load real images. Gallery tests can assert the `img` elements exist with correct `src` attributes but can't verify visual rendering. → Acceptable for functional E2E; visual testing is a non-goal.
- **Search filter timing**: Filtering dispatches Redux actions and triggers API refetches. Tests need `waitForResponse` or visibility assertions with timeouts to avoid flaky results. → Use `expect().toBeVisible({ timeout })` patterns consistently.
- **Date-dependent defaults**: The Search component defaults `dateTo` to today's date. Seeded photos have fixed dates, so date range assertions must account for this. → Explicitly set date ranges in filter tests rather than relying on defaults.
