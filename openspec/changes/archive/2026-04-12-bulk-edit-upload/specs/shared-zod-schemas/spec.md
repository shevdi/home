## MODIFIED Requirements

### Requirement: Shared package exports Zod schemas for photos API

The shared package SHALL export Zod schemas for the photos API contract: `photoOrderSchema`, `photoSearchParamsSchema`, `uploadBodySchema`, `uploadMetaSchema`, `uploadMetaItemSchema`, and `perFileOptionsItemSchema`. These schemas SHALL be consumable by both client and server.

The `uploadBodySchema` SHALL include a `perFileOptions` field that accepts an optional JSON string, parsed into an array of `perFileOptionsItemSchema` objects. If absent or invalid, it SHALL default to an empty array.

#### Scenario: Server imports photos query schema

- **WHEN** server imports `photoSearchParamsSchema` from `@shevdi-home/shared`
- **THEN** the schema validates `Record<string, string | string[]>` (Express req.query shape) and produces typed output with page, dateFrom, dateTo, order, tags, country, city

#### Scenario: Client imports photos query schema

- **WHEN** client imports `photoSearchParamsSchema` from `@shevdi-home/shared`
- **THEN** the schema parses URL search params into typed `PhotoSearchParams` without manual `isPhotoOrder` or `ORDER_VALUES` logic

#### Scenario: Upload body schema shared

- **WHEN** server or client imports `uploadBodySchema` from shared
- **THEN** the schema validates private, tags, country, city, meta, perFileOptions with appropriate transforms (stringOrArray, JSON parse)

#### Scenario: perFileOptions schema validates per-file items

- **WHEN** `uploadBodySchema` parses a body with `perFileOptions: '[{"title":"sunset","tags":["travel"],"priority":5}]'`
- **THEN** the parsed output contains `perFileOptions: [{ title: "sunset", tags: ["travel"], country: [], city: [], priority: 5 }]`

#### Scenario: perFileOptions absent defaults to empty array

- **WHEN** `uploadBodySchema` parses a body without `perFileOptions` field
- **THEN** the parsed output contains `perFileOptions: []`

#### Scenario: Types inferred from schemas

- **WHEN** consumer imports `PhotoOrder`, `PhotoSearchParams`, `UploadBody`, or `PerFileOptionsItem` from shared
- **THEN** these types are `z.infer<>` of the corresponding schemas
