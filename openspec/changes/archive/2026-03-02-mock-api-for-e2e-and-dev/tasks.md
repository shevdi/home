## 1. Mock Server Setup

- [x] 1.1 Create `mock-server/` directory with `package.json` (express dependency) and `tsconfig.json`
- [x] 1.2 Create `mock-server/Dockerfile` for building the mock server container
- [x] 1.3 Create `mock-server/src/index.ts` — Express app entry point listening on `PORT` (default 3004), with CORS and JSON body parsing

## 2. Drime Mock Endpoints

- [x] 2.1 Implement `POST /auth/login` — return `{ data: { user: { access_token: "mock-token" } } }`
- [x] 2.2 Implement in-memory file entry store with seed data and auto-increment ID
- [x] 2.3 Implement `GET /drive/file-entries` — return paginated list from in-memory store
- [x] 2.4 Implement `GET /file-entries/:id` — redirect to placeholder image URL or 404
- [x] 2.5 Implement `POST /uploads` — accept multipart, create in-memory entry, return `{ fileEntry: {...} }`
- [x] 2.6 Implement `POST /file-entries/delete` — remove entries from memory, return 200

## 3. Geocoding Mock Endpoints

- [x] 3.1 Implement `POST /suggestions/api/4_1/rs/geolocate/address` — return fixed DaData-format response with country/city
- [x] 3.2 Implement `GET /reverse` — return fixed Nominatim-format response with address object

## 4. Server Service URL Configuration

- [x] 4.1 Update `server/src/services/dadata.ts` — read base URL from `DADATA_URL` env var, default to `https://suggestions.dadata.ru`
- [x] 4.2 Update `server/src/services/nominatim.ts` — read base URL from `NOMINATIM_URL` env var, default to `https://nominatim.openstreetmap.org`

## 5. Docker & Scripts

- [x] 5.1 Create `docker-compose.e2e.yml` with mock-server service and backend env var overrides pointing at mock
- [x] 5.2 Add `docker:up:e2e` and `e2e:mock` npm scripts to root `package.json`
