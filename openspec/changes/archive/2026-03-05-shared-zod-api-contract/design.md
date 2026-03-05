# Shared Zod API Contract – Design

## Context

The codebase has:
- **Server**: Zod schemas in `photos.schema.ts` (query, upload body, meta); env schema in `config/env.ts`; manual validation in auth.
- **Client**: Manual parsing in `useQueryParams` (ORDER_VALUES, isPhotoOrder); form schemas in Search, UploadPhoto, EditPhoto, EditPage; types in `client/shared/types/photos.ts`.
- **Shared**: Pure types in `shared/types/`; no Zod. `ILocationValue` exists in links.ts but server redefines `LocationValue` in getLocationValue.ts.
- **Zod versions**: Client uses zod ^4.x, server uses zod ^3.x. Shared schemas require a single version.

## Goals / Non-Goals

**Goals:**
- Single source of truth for photos API contract (query, upload) via shared Zod schemas.
- Shared types for API responses (IPhotosResponse, IPagination), location (ILocationValue), Nominatim, and ApiResponse.
- Client uses shared schemas for URL param parsing; server uses shared schemas for req.query/req.body.
- Remove duplication (LocationValue, PhotoOrder, parsePhotoSearch logic).

**Non-Goals:**
- Moving env schema to shared (server-only).
- Moving form-specific schemas (Search, UploadPhoto, EditPhoto) to shared; those stay in client.
- Adding Zod validation to auth or page routes (out of scope).

## Decisions

### 1. Shared package structure for schemas

**Choice:** Add `shared/schemas/photos.schema.ts` (or `shared/types/schemas/photos.ts`) and export from `shared/types/index.ts` or a new `shared/schemas/index.ts`.

**Rationale:** Keeps schemas separate from pure types; both can be imported from shared. Alternative: `shared/types/photos.schema.ts` alongside types.

### 2. Zod version alignment

**Choice:** Align shared, client, and server on Zod 3.x (e.g. ^3.23.8). Server already uses 3.x; client would downgrade from 4.x.

**Alternative:** Align on Zod 4.x (client keeps current; server upgrades). Zod 4 has breaking changes; 3.x is more stable for shared schemas.

**Rationale:** Downgrading client is simpler than upgrading server; Zod 3 is widely used. If client has Zod 4-only features, we can revisit.

### 3. Query param input shape

**Choice:** Shared schema accepts `Record<string, string | string[]>` (same as Express req.query and React Router searchParams).

**Rationale:** Both server and client receive this shape from URL. Single schema handles both.

### 4. ILocationValue vs LocationValue

**Choice:** Server imports `ILocationValue` from shared and removes local `LocationValue`. `getLocationValue` return type becomes `ILocationValue`.

**Rationale:** Same shape; shared already has the type. Eliminates duplication.

### 5. Search form schema stays in client

**Choice:** Search form schema (countryInput, cityInput, tagInput, etc.) remains in `Search.tsx`. Only API contract (photoSearchParamsSchema) moves to shared.

**Rationale:** Form schema is UI-specific; not part of API contract. Client uses shared schema for parsing URL; form can extend it later if needed.

### 6. Nominatim types

**Choice:** Shared types for Nominatim API: `NominatimAddress` (Record or explicit fields), `NominatimReverseResponse`. Used by client `useReverseGeocode` and server `nominatim.ts`.

**Rationale:** Both call the same Nominatim API; shared types avoid drift.

### 7. ApiResponse placement

**Choice:** Add `ApiResponse<T>` to shared. Server already has it in `types/api/index.ts`; move to shared and re-export or keep server types extending shared.

**Rationale:** Client can use it for typed error handling. Single definition.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Zod version mismatch breaks client | Pin exact version in shared; test client and server after alignment |
| Client Zod 4 features lost | Audit client Zod usage; if 4-only features exist, consider aligning on 4.x |
| Shared package grows too large | Keep schemas minimal; only API contract schemas |
| Breaking changes | Types are additive; schemas replace existing logic; no schema field removals |

## Migration Plan

1. Add `zod` to shared; align client and server versions.
2. Create shared schemas; export types via `z.infer`.
3. Add shared types (IPhotosResponse, IPagination, Nominatim, ApiResponse).
4. Server: switch photos.schema to import from shared; getLocationValue uses ILocationValue; nominatim uses shared types.
5. Client: useQueryParams uses shared schema; photosApiSlice uses shared types; remove local PhotoOrder, IPhotoSearchParams.
6. Remove client `shared/types/photos.ts` duplicates; re-export from shared where needed.
7. Run tests; verify no regressions.

## Open Questions

- Exact Zod version (3.23.x vs 3.24.x vs latest 3.x).
- Whether to add `shared/schemas` as separate entry point or keep under `shared/types`.
