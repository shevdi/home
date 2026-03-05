# shared-zod-schemas Specification

## Purpose
TBD - created by archiving change shared-zod-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Shared package exports Zod schemas for photos API

The shared package SHALL export Zod schemas for the photos API contract: `photoOrderSchema`, `photoSearchParamsSchema`, `uploadBodySchema`, `uploadMetaSchema`, and `uploadMetaItemSchema`. These schemas SHALL be consumable by both client and server.

#### Scenario: Server imports photos query schema

- **WHEN** server imports `photoSearchParamsSchema` from `@shevdi-home/shared`
- **THEN** the schema validates `Record<string, string | string[]>` (Express req.query shape) and produces typed output with page, dateFrom, dateTo, order, tags, country, city

#### Scenario: Client imports photos query schema

- **WHEN** client imports `photoSearchParamsSchema` from `@shevdi-home/shared`
- **THEN** the schema parses URL search params into typed `PhotoSearchParams` without manual `isPhotoOrder` or `ORDER_VALUES` logic

#### Scenario: Upload body schema shared

- **WHEN** server or client imports `uploadBodySchema` from shared
- **THEN** the schema validates private, tags, country, city, meta with appropriate transforms (stringOrArray, meta JSON parse)

#### Scenario: Types inferred from schemas

- **WHEN** consumer imports `PhotoOrder` or `PhotoSearchParams` or `UploadBody` from shared
- **THEN** these types are `z.infer<>` of the corresponding schemas

### Requirement: Shared package has zod dependency

The shared package SHALL list `zod` as a dependency. Client and server SHALL use a compatible Zod version (same major) when consuming shared schemas.

#### Scenario: Shared package installs zod

- **WHEN** root runs `npm install`
- **THEN** shared package has access to zod and schemas parse/validate without error

#### Scenario: Schema exports work across packages

- **WHEN** client or server imports a shared schema and calls `.safeParse()` or `.parse()`
- **THEN** validation succeeds or fails consistently

### Requirement: Helper schemas exported for reuse

The shared package SHALL export `stringOrArray` and `queryParam` (or equivalent) as reusable schema helpers used by `photoSearchParamsSchema` and `uploadBodySchema`.

#### Scenario: stringOrArray normalizes to array

- **WHEN** `stringOrArray` parses a value that is string, string[], or undefined
- **THEN** output is `string[]` (empty array for undefined)

#### Scenario: queryParam handles single or array

- **WHEN** `queryParam` parses URL query value (string or string[])
- **THEN** output is single string or undefined

