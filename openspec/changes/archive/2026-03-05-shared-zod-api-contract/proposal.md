# Shared Zod API Contract

## Why

Types and validation for the client-server API are duplicated across client and server. The server defines Zod schemas for photos query and upload, but the client reimplements equivalent logic manually (e.g. `isPhotoOrder`, `parsePhotoSearch`). Shared types like `ILocationValue` are redefined on the server as `LocationValue`. Moving API schemas and types to `@shevdi-home/shared` establishes a single source of truth for the contract, eliminates duplication, and enables client-side validation before requests.

## What Changes

- **Zod schemas in shared**: Move `photoOrderSchema`, `photoSearchParamsSchema`, `uploadBodySchema`, `uploadMetaSchema`, and helpers (`stringOrArray`, `queryParam`) to shared. Both client and server import from shared.
- **Types from Zod**: Replace manual types (`PhotoOrder`, `IPhotoSearchParams`, `PhotosQuery`, `UploadBody`) with `z.infer<>` from shared schemas where they represent the API contract.
- **Shared types (high)**: Add `ILocationValue` usage on server (remove duplicate `LocationValue`), add `IPhotosResponse` and `IPagination` for photos API response, add `NominatimAddress` and `NominatimReverseResponse` for Nominatim API contract.
- **Shared types (medium)**: Add `ApiResponse<T>` for typed API error handling on client.
- **Client**: Use shared schemas for `useQueryParams` parsing; Search form schema (with `countryInput`, `tagInput`, etc.) stays in client as it is not part of the API contract.
- **Server**: Import schemas from shared; remove local duplicates. Use `ILocationValue` from shared.
- **Zod version alignment**: Ensure client and server use the same Zod major version for shared schemas.

## Capabilities

### New Capabilities

- `shared-zod-schemas`: Zod schemas for photos API (query params, upload body, upload meta) in shared package. Exported schemas and inferred types. Consumed by client and server.
- `shared-photos-api-types`: Shared types for photos API contract: `IPhotosResponse`, `IPagination`, `ILocationValue` (server adopts; remove `LocationValue` duplicate).
- `shared-nominatim-types`: Shared types for Nominatim reverse geocode API: `NominatimAddress`, `NominatimReverseResponse`. Used by client `useReverseGeocode` and server `nominatim` service.
- `shared-api-response`: `ApiResponse<T>` type in shared for typed API responses and error handling on client.

### Modified Capabilities

- `shared-types-package`: Extend with new types and Zod-based inferred types. `IPhotoSearchParams` and `PhotoOrder` become Zod-inferred from shared schemas.

## Impact

- **Shared**: New `schemas/` (or `types/schemas/`) with Zod; add `zod` dependency. New/updated types in `types/`.
- **Server**: `photos.schema.ts` imports from shared; `getLocationValue.ts` uses `ILocationValue`; `nominatim.ts` uses shared Nominatim types.
- **Client**: `useQueryParams` uses shared schema for parsing; `photosApiSlice` uses shared types; `getErrorMessage` can use `ApiResponse`; Search form schema stays local.
- **Dependencies**: Add `zod` to shared; align client and server Zod versions.
