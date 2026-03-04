## ADDED Requirements

### Requirement: Server external service URLs are configurable
The server's `dadata.ts` and `nominatim.ts` services SHALL read their base URLs from environment variables (`DADATA_URL`, `NOMINATIM_URL`), falling back to the real service URLs when the env vars are not set. The Drime service already reads `DRIME_URL` from env and requires no change.

#### Scenario: DaData uses custom URL when env var set
- **WHEN** `DADATA_URL` is set to `http://mock-server:3004`
- **THEN** the `dadataReverseGeocode` function sends requests to `http://mock-server:3004/suggestions/api/4_1/rs/geolocate/address`

#### Scenario: DaData uses default URL when env var not set
- **WHEN** `DADATA_URL` is not set
- **THEN** the `dadataReverseGeocode` function sends requests to `https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address`

#### Scenario: Nominatim uses custom URL when env var set
- **WHEN** `NOMINATIM_URL` is set to `http://mock-server:3004`
- **THEN** the `nominatimReverseGeocode` function sends requests to `http://mock-server:3004/reverse`

#### Scenario: Nominatim uses default URL when env var not set
- **WHEN** `NOMINATIM_URL` is not set
- **THEN** the `nominatimReverseGeocode` function sends requests to `https://nominatim.openstreetmap.org/reverse`

### Requirement: Docker Compose e2e config exists
A `docker-compose.e2e.yml` SHALL define a `mock-server` service built from `mock-server/` and override the backend's `DRIME_URL`, `DADATA_URL`, and `NOMINATIM_URL` to point at `http://mock-server:3004`. It SHALL include the same real database and backend services as dev.

#### Scenario: Start e2e environment
- **WHEN** the user runs `docker compose -f docker-compose.e2e.yml up --build`
- **THEN** the mock server, real backend, real database, and frontend all start, with the backend's external service env vars pointing at the mock server

### Requirement: npm scripts for e2e with mock
The root `package.json` SHALL include scripts to start the e2e environment and run tests against it (e.g., `docker:up:e2e`, `e2e:mock`).

#### Scenario: Start e2e environment via script
- **WHEN** the user runs `npm run docker:up:e2e`
- **THEN** the e2e Docker Compose stack starts (equivalent to `docker compose -f docker-compose.e2e.yml up --build`)

#### Scenario: Run e2e tests via script
- **WHEN** the user runs `npm run e2e:mock`
- **THEN** the Playwright tests execute against the e2e environment
