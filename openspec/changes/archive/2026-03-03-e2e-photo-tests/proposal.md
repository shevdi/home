## Why

The photo gallery is the core feature of the app, but `photos.spec.ts` currently contains only empty test stubs with no assertions. All 10 test cases (6 authenticated, 4 unauthenticated) are placeholder `test()` blocks with no implementation. This leaves the most complex user-facing flows entirely uncovered by E2E tests. Additionally, several edge cases around search/filtering, pagination, navigation, and empty states are not represented at all.

## What Changes

- Implement all 10 existing test stubs in `e2e/tests/photos.spec.ts` with real page interactions and assertions
- Add missing edge-case tests:
  - **Search & filter**: filter by date range, tags, country/city; verify results update
  - **Gallery sort order**: verify photos respect selected ordering
  - **Photo navigation**: prev/next links on single photo page
  - **Empty gallery**: verify empty state when no photos match filters
  - **Private badge visibility**: private photos show badge for admin, hidden for guests
  - **Full-size link**: verify "Full size" link on single photo page
  - **Photo metadata display**: camera info, date taken, location shown on detail page

## Capabilities

### New Capabilities
- `e2e-photo-tests`: Comprehensive E2E test coverage for all photo flows — gallery viewing, filtering/search, single photo navigation, upload, edit, delete, and access control for both authenticated and unauthenticated users.

### Modified Capabilities
- `e2e-test-suite`: Expanding the "Photo flows are covered by E2E tests" requirement with detailed scenarios for filtering, navigation, metadata, and edge cases.

## Impact

- `e2e/tests/photos.spec.ts` — primary file being changed (implement stubs + add new tests)
- `e2e/tests/fixtures/photo-mocks.ts` — may need additional/adjusted mock data for edge cases (e.g., photos with specific tags, date ranges, locations)
- `e2e/tests/helpers/` — existing `api.ts` and `auth.ts` helpers are sufficient; no new helpers expected
- No server or client code changes required — tests use existing UI and seeded test data
