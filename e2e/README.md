# E2E Tests (Playwright)

End-to-end tests for the home-auth app using Playwright.

## Prerequisites

- **Dev server must be running** before executing E2E tests. Start it with:
  ```bash
  npm run dev
  ```
  Keep this running in a separate terminal.

- **Test user credentials** (for auth-related tests): Set `E2E_LOGIN` and `E2E_PASSWORD` to a valid admin user in your database. Example:
  ```bash
  E2E_LOGIN=admin E2E_PASSWORD=yourpassword npm run e2e
  ```
  Tests that require authentication will be skipped if these are not set.

## Running tests

From the project root:

```bash
npm run e2e
```

Or from the `e2e` directory:

```bash
npm run test
```

### Debug mode

Run with Playwright Inspector (step through tests, inspect page):

```bash
npm run e2e:debug
```

Or with a visible browser only (no inspector):

```bash
npm run e2e:headed
```

## Test structure

- `tests/auth.spec.ts` – Login flow (form display, invalid credentials, successful login)
- `tests/navigation.spec.ts` – Main route navigation and photo detail
- `tests/photos.spec.ts` – Photo gallery, single photo, upload access (auth vs redirect)
