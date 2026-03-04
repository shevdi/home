## Context

The server depends on three external services during photo upload and retrieval:

1. **Drime** (`DRIME_URL`) — Cloud file storage. Handles photo upload (`/uploads`), file listing (`/drive/file-entries`), file URL resolution (`/file-entries/{id}`), and deletion (`/file-entries/delete`). Auth via `/auth/login` returning an access token.
2. **DaData** — Reverse geocoding for Russian addresses. Called via `fetch` to a hardcoded URL (`https://suggestions.dadata.ru/...`).
3. **Nominatim** — OSM reverse geocoding. Called via `fetch` to a hardcoded URL (`https://nominatim.openstreetmap.org/reverse`).

E2E and dev runs require valid credentials and network access to all three. The real backend, MongoDB, and auth flow stay unchanged — only these external HTTP dependencies get replaced by a local mock.

## Goals / Non-Goals

**Goals:**
- Mock all Drime API endpoints the server calls (login, file entries, uploads, delete)
- Mock DaData and Nominatim geocoding endpoints with realistic fixture responses
- Make external service URLs configurable in the server so the backend can point at the mock
- Provide a Docker Compose config that wires the real backend to the mock server
- Enable running E2E tests without any external API keys or network access to third-party services

**Non-Goals:**
- Mocking the home-auth backend itself (auth, pages, photos routes stay real)
- Replacing MongoDB — the real database is still used
- Matching exact Drime/DaData/Nominatim response schemas byte-for-byte — only the fields the server actually reads need to be present
- Supporting upload processing (sharp resizing) in the mock — the real backend still does this, the mock just accepts and returns fake file entries

## Decisions

### 1. Standalone Express mock server in `mock-server/`

**Decision**: New `mock-server/` directory with a minimal Express app that serves all three external APIs on a single port (3004).

**Rationale**: A single server is simpler to run and configure than three separate mocks. The Drime, DaData, and Nominatim APIs have non-overlapping path prefixes, so they coexist on one server without routing conflicts. Port 3004 avoids conflicts with frontend (3000) and backend (3001).

**Alternatives considered**:
- *Separate mock per service*: More realistic but triple the operational overhead for no practical benefit.
- *MSW or nock inside the server process*: Couples mock to server code and risks leaking into production.

### 2. Make service URLs configurable via env vars

**Decision**: Add `DADATA_URL` and `NOMINATIM_URL` env vars to `dadata.ts` and `nominatim.ts`, defaulting to the real URLs. The existing `DRIME_URL` already supports this.

**Rationale**: The Drime service already reads `DRIME_URL` from env. DaData and Nominatim have hardcoded URLs. Adding env var overrides is a minimal, non-breaking change that lets Docker Compose point all three at the mock.

### 3. In-memory state with realistic fixture data

**Decision**: The mock server stores file entries in memory. Uploads create new entries with auto-incremented IDs. File URL resolution returns placeholder URLs. Geocoding returns a fixed Moscow response.

**Rationale**: The server only reads specific fields from these APIs (`id`, `url`, `access_token`, `suggestions[0].data`, `address`). The mock needs to return just enough structure for the server code to proceed without errors.

### 4. Docker Compose overlay for e2e (`docker-compose.e2e.yml`)

**Decision**: A new compose file that adds the mock server service and overrides the backend's `DRIME_URL`, `DADATA_URL`, and `NOMINATIM_URL` to point at `http://mock-server:3004`.

**Rationale**: Keeps dev and e2e configs separate. Uses the same real backend and database, just with external services swapped.

## Risks / Trade-offs

- **API drift**: If Drime/DaData/Nominatim change their response formats, the mock won't match.
  → Mitigation: The mock only returns fields the server actually reads. Drift in unused fields is harmless.

- **Upload fidelity**: The mock accepts any POST to `/uploads` but doesn't process images. If server code ever inspects the uploaded content's response beyond `fileEntry.id` and URL, the mock may need updates.
  → Mitigation: The server only uses `id`, `name`, and URL from upload responses — all trivially mocked.

- **Geocoding accuracy**: Tests will always see the same location data regardless of GPS coordinates sent.
  → Mitigation: For E2E, the specific location doesn't matter — we only need the data flow to work. More granular geocoding testing belongs in unit tests.
