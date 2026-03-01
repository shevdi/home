## Context

The project is a full-stack app (client + server) with React Router, auth (login, RequireAuth for admin), and features: Welcome, Home, Projects, Photos. Playwright is already in `e2e/package.json` with a minimal config (`baseURL: localhost:3000`, `testDir: ./e2e`). No E2E tests exist. The client runs on port 3000 (webpack dev server), the server on another port; the client proxies API calls.

## Goals / Non-Goals

**Goals:**

- Add Playwright E2E tests covering login, navigation, and photo flows
- Run tests against the full stack (dev server must be up or started before tests)
- Provide a simple npm script to run E2E tests from the project root
- Use the existing `e2e` package and Playwright setup

**Non-Goals:**

- CI integration (future work)
- Visual regression or screenshot testing
- Testing against production or staging
- Replacing or duplicating unit tests

## Decisions

### 1. Test directory layout

**Decision:** Place tests in `e2e/tests/` (e.g., `e2e/tests/auth.spec.ts`, `e2e/tests/navigation.spec.ts`, `e2e/tests/photos.spec.ts`) and set `testDir: './tests'` in `playwright.config.ts` (relative to `e2e/`).

**Rationale:** Keeps tests separate from config and fixtures. The current `testDir: './e2e'` would point to `e2e/e2e/`, which is confusing; `./tests` is clearer.

**Alternative:** Use `testDir: '.'` and put specs next to config. Rejected: mixes config and tests.

### 2. Dev server lifecycle

**Decision:** Tests assume the dev server is already running. Add a root script `e2e` (or `test:e2e`) that runs `npm run test` in the e2e package. Document that users must run `npm run dev` in a separate terminal first.

**Rationale:** Avoids complex start/stop logic and port conflicts. Matches common Playwright usage. Future CI can use `npx concurrently` or similar if needed.

**Alternative:** Use `webServer` in Playwright config to auto-start the dev server. Rejected for now: adds complexity and potential flakiness; can be added later if desired.

### 3. Auth test data

**Decision:** Use a known test user (e.g., from seed data or env) for login tests. If no test user exists, document the requirement and add a minimal seed or fixture.

**Rationale:** E2E tests need deterministic auth. Checking for existing auth setup in the codebase will inform the exact approach.

**Alternative:** Mock auth at the API layer. Rejected: E2E should test real flows.

### 4. Test isolation

**Decision:** Each test navigates to a known state and does not rely on shared browser state. Use `test.beforeEach` to go to baseURL or a specific route. Avoid shared fixtures that persist auth across unrelated tests unless explicitly testing auth persistence.

**Rationale:** Isolated tests are more reliable and easier to debug.

## Risks / Trade-offs

- **[Risk]** Dev server not running → tests fail with connection errors. **Mitigation:** Clear README/docs; consider adding a simple health-check before running tests.
- **[Risk]** Flaky tests from timing (e.g., slow API). **Mitigation:** Use Playwright auto-waiting; add explicit `expect` for visibility/state where needed; increase timeout if necessary.
- **[Risk]** Test user credentials in repo. **Mitigation:** Use env vars (e.g., `E2E_LOGIN`, `E2E_PASSWORD`) and document in README; add to `.env.example`.
