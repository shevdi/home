## Why

E2E tests currently run against the real backend, MongoDB, and external services (Drime cloud storage, DaData geocoding, Nominatim). This makes tests slow, flaky, and impossible to run without valid API keys and a seeded database. A lightweight mock API server would make E2E tests fast, deterministic, and runnable anywhere — including CI. API request should be possible to switch for mock server.

## What Changes

- Introduce a standalone mock API server (`mock-server/`) that run on `localhost:3004`, listen the same path as drime amd geolocation services. DB and auth are still is real.
- Add a `docker-compose.e2e.yml` that wires the frontend to the mock server instead of the real backend
- Update Playwright config and helpers to work against the mock-backed environment
- Add npm scripts for running e2e with the mock server (`e2e:mock`, `docker:up:e2e`)

## Capabilities

### New Capabilities
- `mock-api-server`: A lightweight Express server that mirrors the real API endpoints with in-memory data and no external dependencies, providing deterministic responses for drime, dadata and nominatim
- `e2e-mock-environment`: Docker Compose configuration and npm scripts to run the frontend against the mock API for isolated, repeatable e2e testing

### Modified Capabilities
_(none — no existing spec-level requirements are changing)_

## Impact

- **New code**: `mock-server/` directory with Express app, seed data, and Dockerfile
- **New config**: `docker-compose.e2e.yml`
- **Modified config**: `package.json` (new scripts), `e2e/playwright.config.ts` (optional mock profile)
- **Dependencies**: None new for the mock server beyond express (already a project dep). Playwright tests themselves remain unchanged — they interact with the same UI; only the backend behind it differs.
- **No breaking changes**: The real backend, docker-compose.dev.yml, and production flow are untouched.
