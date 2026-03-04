## ADDED Requirements

### Requirement: Mock server implements Drime auth endpoint
The mock server SHALL handle `POST /auth/login` and return a JSON response containing `{ data: { user: { access_token: "<token>" } } }`. The token value can be any non-empty string. The endpoint SHALL accept any credentials without validation.

#### Scenario: Drime login returns access token
- **WHEN** the real backend sends `POST /auth/login` to the mock server with email, password, and token_name
- **THEN** the mock returns HTTP 200 with a JSON body containing a `data.user.access_token` string

### Requirement: Mock server implements Drime file entries listing
The mock server SHALL handle `GET /drive/file-entries` with optional `page` and `perPage` query params. It SHALL return `{ data: [{ id, url }], meta: { last_page, current_page } }` from its in-memory file entry store.

#### Scenario: List file entries
- **WHEN** the real backend sends `GET /drive/file-entries?perPage=10&page=1` to the mock
- **THEN** the mock returns HTTP 200 with a paginated list of file entry objects containing `id` fields

### Requirement: Mock server implements Drime file entry retrieval
The mock server SHALL handle `GET /file-entries/:id`. If the entry exists in-memory, the server SHALL respond with a 302 redirect to a placeholder image URL (or return the URL in the response). If not found, it SHALL return HTTP 404.

#### Scenario: Get existing file entry
- **WHEN** the real backend sends `GET /file-entries/123` and entry 123 exists
- **THEN** the mock responds with a redirect or response that resolves to a URL string

#### Scenario: Get non-existent file entry
- **WHEN** the real backend sends `GET /file-entries/999` and entry 999 does not exist
- **THEN** the mock returns HTTP 404

### Requirement: Mock server implements Drime file upload
The mock server SHALL handle `POST /uploads` with multipart form data. It SHALL create a new in-memory file entry with an auto-incremented `id` and return `{ fileEntry: { id, name, file_name, ... } }` with HTTP 200.

#### Scenario: Upload a file
- **WHEN** the real backend sends a multipart `POST /uploads` with a file, parentId, and relativePath
- **THEN** the mock creates an in-memory entry and returns `{ fileEntry: { id: <new_id>, name: <filename>, ... } }` with HTTP 200

### Requirement: Mock server implements Drime file deletion
The mock server SHALL handle `POST /file-entries/delete` with `{ entryIds: string[] }`. It SHALL remove the matching entries from in-memory storage and return HTTP 200.

#### Scenario: Delete file entries
- **WHEN** the real backend sends `POST /file-entries/delete` with `{ entryIds: ["1", "2"] }`
- **THEN** the mock removes entries 1 and 2 from memory and returns HTTP 200

### Requirement: Mock server implements DaData geocoding endpoint
The mock server SHALL handle `POST /suggestions/api/4_1/rs/geolocate/address`. It SHALL return a fixed response with `{ suggestions: [{ value, unrestricted_value, data: { country, city, ... } }] }` regardless of input coordinates.

#### Scenario: Reverse geocode coordinates
- **WHEN** the real backend sends `POST /suggestions/api/4_1/rs/geolocate/address` with `{ lat, lon }`
- **THEN** the mock returns HTTP 200 with a suggestions array containing at least one entry with `data.country` and `data.city` fields

### Requirement: Mock server implements Nominatim geocoding endpoint
The mock server SHALL handle `GET /reverse` with query params `format`, `lat`, `lon`, `zoom`, `addressdetails`. It SHALL return a fixed response with `{ address: { country, city, ... }, display_name, ... }`.

#### Scenario: Reverse geocode coordinates
- **WHEN** the real backend sends `GET /reverse?format=jsonv2&lat=55.75&lon=37.62&zoom=14&addressdetails=1`
- **THEN** the mock returns HTTP 200 with a JSON body containing `address.country` and a `display_name`

### Requirement: Mock server runs on configurable port
The mock server SHALL listen on the port specified by the `PORT` environment variable, defaulting to 3004.

#### Scenario: Start on default port
- **WHEN** the mock server starts without a PORT env var
- **THEN** it listens on port 3004

#### Scenario: Start on custom port
- **WHEN** the mock server starts with `PORT=4000`
- **THEN** it listens on port 4000
