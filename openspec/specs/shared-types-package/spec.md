# Shared Types Package

## Purpose

Provide shared TypeScript types as a workspace package consumable by client, server, mock-server, and e2e.
## Requirements
### Requirement: Shared types package exists as workspace package

The project SHALL provide a shared types package at `shared/` that is consumable by client, server, mock-server, and e2e via npm workspace dependency.

#### Scenario: Package is installable

- **WHEN** root runs `npm install`
- **THEN** `@shevdi-home/shared` is available to workspace packages

#### Scenario: Types are importable

- **WHEN** any package imports `import { ILink } from '@shevdi-home/shared'`
- **THEN** TypeScript resolves the types without error

### Requirement: No copy step for types

The project SHALL NOT use a copy step to distribute shared types. Types SHALL be consumed directly from the shared package.

#### Scenario: Copy script removed

- **WHEN** build or dev runs
- **THEN** no `copy:types` or equivalent script is executed

#### Scenario: Single source of truth

- **WHEN** a type is updated in `shared/types`
- **THEN** all consuming packages see the update without manual sync

### Requirement: Shared types include core domain types

The shared package SHALL export at least: `ILink`, `ILocation`, `IMeta`, `IPhotos`, `IPhotoSearch`, `IPhotoSearchParams` (or equivalent), and page-related types.

#### Scenario: Typo fix

- **WHEN** shared types are used
- **THEN** `IPhotos` uses `description` (not `descriptopn`)

### Requirement: ILocation.nominatim supports address structure for reverse geocoding

The shared package SHALL define `ILocation.nominatim` such that it MAY include an optional `address` field of type `Record<string, string | undefined>`. This structure SHALL allow consumers (e.g. `getLocationParts`) to access `location.nominatim?.address` without type assertions.

#### Scenario: getLocationParts uses nominatim without assertion

- **WHEN** `getLocationParts` receives an `ILocation` with `nominatim.address` populated
- **THEN** the function accesses `nominatim.address` and extracts city/country without using `as` type assertions

#### Scenario: Backward compatibility with existing data

- **WHEN** `ILocation` has `nominatim` as a plain object or without `address`
- **THEN** TypeScript still accepts the value and consumers can safely check `nominatim?.address` before use

### Requirement: PhotoOrder and IPhotoSearchParams from Zod inference

The shared package SHALL export `PhotoOrder` and `PhotoSearchParams` (or `IPhotoSearchParams`) as types inferred from shared Zod schemas (`photoOrderSchema`, `photoSearchParamsSchema`). These SHALL replace manual type definitions for the photos API contract.

#### Scenario: PhotoOrder from schema

- **WHEN** consumer imports `PhotoOrder` from shared
- **THEN** it is `z.infer<typeof photoOrderSchema>` (union of 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited')

#### Scenario: IPhotoSearchParams from schema

- **WHEN** consumer imports `PhotoSearchParams` or `IPhotoSearchParams` from shared
- **THEN** it is `z.infer<typeof photoSearchParamsSchema>` or equivalent, with page, dateFrom, dateTo, order, tags, country, city

