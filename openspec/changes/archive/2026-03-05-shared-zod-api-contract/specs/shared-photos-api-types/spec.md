# Shared Photos API Types

## ADDED Requirements

### Requirement: IPhotosResponse type in shared

The shared package SHALL export `IPhotosResponse` describing the photos list API response shape: `photos: ILink[]` and `pagination` with `currentPage`, `totalPages`, `totalCount`, `pageSize`.

#### Scenario: Client uses IPhotosResponse for API response

- **WHEN** client's photosApiSlice or similar imports `IPhotosResponse`
- **THEN** the response from GET /api/v1/photos is typed without assertion

#### Scenario: Server response matches IPhotosResponse

- **WHEN** server returns `res.json({ photos, pagination })` from photos route
- **THEN** the shape satisfies `IPhotosResponse`

### Requirement: IPagination type in shared

The shared package SHALL export `IPagination` with `currentPage`, `totalPages`, `totalCount`, `pageSize`. `IPhotosResponse` SHALL use `IPagination` for its pagination field.

#### Scenario: IPagination reusable

- **WHEN** another API returns paginated results
- **THEN** it can use `IPagination` for the pagination object shape

### Requirement: Server uses ILocationValue from shared

The server SHALL use `ILocationValue` from `@shevdi-home/shared` for location value shape. The server SHALL NOT define a duplicate `LocationValue` type.

#### Scenario: getLocationValue returns ILocationValue

- **WHEN** server's `getLocationValue` function returns its result
- **THEN** the return type is `ILocationValue` imported from shared

#### Scenario: No LocationValue duplicate

- **WHEN** searching the server codebase for `LocationValue` type definition
- **THEN** no local definition exists; only `ILocationValue` from shared is used
