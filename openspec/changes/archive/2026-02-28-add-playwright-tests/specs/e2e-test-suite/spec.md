## ADDED Requirements

### Requirement: E2E tests run against full app

The E2E test suite SHALL run against the full application (client + server) with the dev server already running. Tests SHALL use the Playwright config in `e2e/playwright.config.ts` with `baseURL` pointing to the client (e.g., `http://localhost:3000`).

#### Scenario: Tests execute when dev server is running

- **WHEN** the dev server is running and the user runs the E2E test command
- **THEN** Playwright launches a browser, navigates to the app, and executes all test files

#### Scenario: Tests fail when dev server is not running

- **WHEN** the dev server is not running and the user runs the E2E test command
- **THEN** tests fail with connection/navigation errors (no silent passes)

### Requirement: Login flow is covered by E2E tests

The system SHALL have at least one E2E test that verifies the login flow: navigate to `/login`, enter credentials, submit, and assert successful authentication (e.g., redirect or visible authenticated state).

#### Scenario: Successful login

- **WHEN** user navigates to `/login`, enters valid credentials, and submits
- **THEN** the user is authenticated and sees an authenticated state (e.g., redirect to home or visible admin UI)

#### Scenario: Failed login

- **WHEN** user navigates to `/login`, enters invalid credentials, and submits
- **THEN** an error message or indication of failed login is shown

### Requirement: Navigation flows are covered by E2E tests

The system SHALL have E2E tests that verify navigation between main routes: index (`/`), `/home`, `/projects`, `/photos`, and `/login`. Tests SHALL assert that each route renders expected content (e.g., page title or key element).

#### Scenario: Navigate to each main route

- **WHEN** user navigates to `/`, `/home`, `/projects`, `/photos`, or `/login`
- **THEN** the corresponding page renders with expected content

#### Scenario: Navigate within photos

- **WHEN** user is on `/photos` and clicks a photo or navigates to a photo detail URL
- **THEN** the photo detail page (`/photos/:id`) renders

### Requirement: Photo flows are covered by E2E tests

The system SHALL have E2E tests for viewing the photo gallery and (when authenticated) for upload and edit flows. Unauthenticated users SHALL be able to view photos; authenticated (admin) users SHALL be able to access upload and edit pages.

#### Scenario: View photo gallery

- **WHEN** user navigates to `/photos`
- **THEN** the photo gallery or list is displayed

#### Scenario: View single photo

- **WHEN** user navigates to `/photos/:id` for an existing photo
- **THEN** the photo detail view is displayed

#### Scenario: Authenticated user can access upload page

- **WHEN** an authenticated admin user navigates to `/photos/new`
- **THEN** the upload photo page is displayed

#### Scenario: Unauthenticated user cannot access upload page

- **WHEN** an unauthenticated user navigates to `/photos/new`
- **THEN** the user is redirected to login or sees an access-denied state

### Requirement: E2E test run script from project root

The project SHALL provide an npm script (e.g., `e2e` or `test:e2e`) at the root that runs the Playwright test suite. The script SHALL invoke the e2e package's test command (e.g., `npm run test --prefix e2e` or `npx playwright test` from the e2e directory).

#### Scenario: Run E2E tests from root

- **WHEN** user runs the root E2E script (e.g., `npm run e2e`)
- **THEN** Playwright tests in the e2e package are executed
