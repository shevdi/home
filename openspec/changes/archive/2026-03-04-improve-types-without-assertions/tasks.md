## 1. Typed Env Config

- [x] 1.1 Add zod to server package.json
- [x] 1.2 Create server/src/config/env.ts with zod schema for ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, DRIME_TOKEN (optional), NOMINATIM_URL (optional)
- [x] 1.3 Migrate auth.ts to use env config instead of process.env
- [x] 1.4 Migrate optionalAuth.ts and verifyJWT.ts to use env config
- [x] 1.5 Migrate drime.ts to use env config

## 2. Shared Types – ILocation.nominatim

- [x] 2.1 Extend ILocation.nominatim in shared/types/links.ts with optional address structure
- [x] 2.2 Remove `as` assertions from getLocationParts.ts (client)

## 3. MongoFilter and QueryBuilder

- [x] 3.1 Add $nor and $and to MongoFilter type in server/src/utils/queryBuilder.ts
- [x] 3.2 Remove `as object[]` assertions from queryBuilder excludeWhere and locationMatch

## 4. Error Type Guards

- [x] 4.1 Add hasStatus(err) type guard in server utils
- [x] 4.2 Update photos.ts getErrorStatus to use hasStatus or axios.isAxiosError
- [x] 4.3 Update drime.ts error handling to use axios.isAxiosError
- [x] 4.4 Update getErrorMessage.ts (client) to narrow via 'data' in error instead of assertion
- [x] 4.5 Update api.ts refresh error handling to use type guard or narrowing

## 5. Photos Routes – Zod Schemas

- [x] 5.1 Create photosQuerySchema for GET /photos query params (page, dateFrom, dateTo, order, tags, country, city)
- [x] 5.2 Create uploadBodySchema for POST /upload body fields (private, tags, country, city, meta)
- [x] 5.3 Update GET /photos handler to parse query with photosQuerySchema; replace angle-bracket assertions
- [x] 5.4 Update POST /upload handler to parse body with uploadBodySchema; replace req.body as string assertions
- [x] 5.5 Parse meta JSON with zod schema instead of JSON.parse + assertion

## 6. useQueryParams and PhotoSearch

- [x] 6.1 Add parsePhotoSearch(raw) that validates/normalizes Record<string, string | string[]> into PhotoSearch
- [x] 6.2 Update useQueryParams to use parsePhotoSearch instead of queryParams as PhotoSearch

## 7. Auth Header Helper

- [x] 7.1 Add getAuthHeader(req) helper that returns string | undefined
- [x] 7.2 Update optionalAuth and verifyJWT to use getAuthHeader instead of authHeader as string

## 8. Cache Middleware

- [x] 8.1 Type wrappedEnd to match Response['end'] signature so res.end = wrappedEnd needs no assertion
