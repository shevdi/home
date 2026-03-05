## 1. Setup

- [x] 1.1 Add zod to shared package.json (align version with server, e.g. ^3.23.8)
- [x] 1.2 Align client Zod version to match shared (downgrade from 4.x to 3.x if needed)
- [x] 1.3 Create shared/schemas/ directory (or shared/types/schemas/)

## 2. Shared Zod Schemas

- [x] 2.1 Create photoOrderSchema and export PhotoOrder type
- [x] 2.2 Create queryParam and stringOrArray helpers
- [x] 2.3 Create photoSearchParamsSchema (page, dateFrom, dateTo, order, tags, country, city) and export PhotoSearchParams type
- [x] 2.4 Create uploadMetaItemSchema and uploadMetaSchema
- [x] 2.5 Create uploadBodySchema and export UploadBody type
- [x] 2.6 Export all schemas and types from shared package

## 3. Shared Types (High & Medium)

- [x] 3.1 Add IPhotosResponse and IPagination to shared types
- [x] 3.2 Add ApiResponse<T> to shared types
- [x] 3.3 Add NominatimAddress and NominatimReverseResponse to shared (or extend INominatimAddress if exists)
- [x] 3.4 Export new types from shared index

## 4. Server Migration

- [x] 4.1 Replace server photos.schema.ts with imports from shared; re-export PhotosQuery if needed
- [x] 4.2 Update getLocationValue.ts to use ILocationValue from shared, remove LocationValue type
- [x] 4.3 Update nominatim.ts to use shared Nominatim types
- [x] 4.4 Update server types/api/index.ts to use ApiResponse from shared or re-export

## 5. Client Migration

- [x] 5.1 Update useQueryParams to use photoSearchParamsSchema.safeParse instead of manual parsePhotoSearch
- [x] 5.2 Update photosApiSlice to use shared PhotoSearchParams, IPhotosResponse, IPagination
- [x] 5.3 Update client shared/types/photos.ts to re-export from shared or remove; keep Search form schema local
- [x] 5.4 Update useReverseGeocode to use shared Nominatim types
- [x] 5.5 Update getErrorMessage or API error handling to use ApiResponse where applicable (optional)

## 6. Cleanup and Verification

- [x] 6.1 Remove client ORDER_VALUES, isPhotoOrder, manual parsePhotoSearch logic
- [x] 6.2 Run typecheck and tests for client and server
- [x] 6.3 Verify no duplicate type definitions remain
