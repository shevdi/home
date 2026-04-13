## ADDED Requirements

### Requirement: Shared types include accessedBy on link-shaped photo entities

The shared package SHALL extend the photo/link type used in API responses (e.g. `ILink`) with an optional `accessedBy` field: an array of objects each containing `userId` as a string (Mongo ObjectId hex).

#### Scenario: Client types list response

- **WHEN** client code maps `GET /api/v1/photos` results to `ILink[]`
- **THEN** `accessedBy` is typed on each item without using `as` assertions for the new field

### Requirement: Upload and update schemas accept accessedBy

The shared Zod schema (or equivalent) for multipart upload body and for JSON photo update SHALL accept an optional `accessedBy` representation that resolves to an array of `{ userId: string }` after parsing, with each `userId` being a valid Mongo ObjectId string when present.

#### Scenario: Parsed upload body includes grants

- **WHEN** the upload body contains a valid `accessedBy` payload alongside other allowed fields
- **THEN** `uploadBodySchema` (or the successor schema) output includes `accessedBy` as an array of objects with `userId` strings

#### Scenario: Invalid user id rejected

- **WHEN** `accessedBy` contains an entry whose `userId` is not a valid ObjectId string
- **THEN** validation fails at the schema boundary used by the server
