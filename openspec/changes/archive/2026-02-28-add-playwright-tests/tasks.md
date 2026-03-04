## 1. Config and scripts

- [x] 1.1 Update `e2e/playwright.config.ts`: set `testDir` to `'./tests'` and ensure `baseURL` is `http://localhost:3000`
- [x] 1.2 Add `e2e` (or `test:e2e`) script to root `package.json` that runs Playwright tests (e.g., `npm run test --prefix e2e`)

## 2. Test structure

- [x] 2.1 Create `e2e/tests/` directory
- [x] 2.2 Add `e2e/tests/auth.spec.ts` with login flow tests (successful login, failed login)
- [x] 2.3 Add `e2e/tests/navigation.spec.ts` with tests for main routes (`/`, `/home`, `/projects`, `/photos`, `/login`) and photo detail navigation
- [x] 2.4 Add `e2e/tests/photos.spec.ts` with tests for gallery view, single photo view, authenticated upload access, and unauthenticated upload redirect

## 3. Auth and fixtures

- [x] 3.1 Determine or add test user credentials (seed data or env vars `E2E_LOGIN`/`E2E_PASSWORD`); document in README or e2e docs
- [x] 3.2 Add auth fixture or helper in `e2e/tests/` (or `e2e/fixtures/`) for tests that need authenticated state

## 4. Verification

- [x] 4.1 Run `npm run dev` in one terminal, then run E2E tests from root; verify all tests pass
- [x] 4.2 Document in README (or e2e README) that dev server must be running before running E2E tests
