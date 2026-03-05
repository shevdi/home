# Shared Types Package

## ADDED Requirements

### Requirement: PhotoOrder and IPhotoSearchParams from Zod inference

The shared package SHALL export `PhotoOrder` and `PhotoSearchParams` (or `IPhotoSearchParams`) as types inferred from shared Zod schemas (`photoOrderSchema`, `photoSearchParamsSchema`). These SHALL replace manual type definitions for the photos API contract.

#### Scenario: PhotoOrder from schema

- **WHEN** consumer imports `PhotoOrder` from shared
- **THEN** it is `z.infer<typeof photoOrderSchema>` (union of 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited')

#### Scenario: IPhotoSearchParams from schema

- **WHEN** consumer imports `PhotoSearchParams` or `IPhotoSearchParams` from shared
- **THEN** it is `z.infer<typeof photoSearchParamsSchema>` or equivalent, with page, dateFrom, dateTo, order, tags, country, city
