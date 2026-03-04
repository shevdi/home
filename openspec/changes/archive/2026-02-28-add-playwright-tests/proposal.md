## Why

The app has unit tests but no end-to-end tests. Playwright is already configured in the `e2e` package, yet no tests exist. E2E tests are needed to validate critical user flows (auth, navigation, photo management) work correctly in a real browser against the full stack, catching integration and UI regressions that unit tests miss.

## What Changes

- Add Playwright E2E test suite in the existing `e2e` package
- Cover core user journeys: login, navigation, photo gallery viewing, and (for authenticated users) photo upload/edit
- Configure test runner for dev workflow (e.g., run against `npm run dev`)
- Add npm script to run E2E tests from project root

## Capabilities

### New Capabilities

- `e2e-test-suite`: Playwright E2E test suite that runs against the full app (client + server), covering auth, navigation, photo flows, and dev workflow (scripts to run tests against local dev server)

### Modified Capabilities

<!-- No existing specs; no requirement changes -->

## Impact

- **Code**: New test files in `e2e/` (tests, fixtures, helpers)
- **Config**: Updates to `e2e/playwright.config.ts` if needed (e.g., baseURL, timeouts)
- **Scripts**: New or updated npm scripts in root `package.json` and/or `e2e/package.json` to run tests
- **Dependencies**: None (Playwright already in `e2e/package.json`)
- **CI**: Optional future CI integration for running E2E tests on commit/PR
