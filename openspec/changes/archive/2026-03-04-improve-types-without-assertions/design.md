# Design: Improve Types Without Assertions

## Context

The codebase uses `as` type assertions in production code for: env vars, Express req/body/query, error handling, shared types (ILocation), MongoFilter, and RTK Query. These bypass type safety. The proposal targets high and medium priority improvements using zod for validation and proper type narrowing.

## Goals / Non-Goals

**Goals:**

- Replace env `as string` with zod-validated config; server fails fast at startup if required vars missing
- Extend `ILocation.nominatim` so `getLocationParts` needs no assertions
- Add `MongoFilter` structure for `$nor`/`$and` so queryBuilder needs no assertions
- Add error type guards (`hasStatus`, use `axios.isAxiosError`) instead of `err as {...}`
- Add zod schemas for photos upload body and query params
- Parse `useQueryParams` output into `PhotoSearch` via validation
- Add `getAuthHeader(req)` helper that narrows without assertion
- Type cache middleware `wrappedEnd` to satisfy `res.end` without assertion

**Non-Goals:**

- RTK Query tag typing (`as never`) — API limitation, leave as-is
- Test file assertions — acceptable for mocks
- Mock-server typing — lower priority

## Decisions

### 1. Env config: zod schema at server entry

**Choice:** Single `server/src/config/env.ts` that exports `env` object. Schema parses `process.env` at import; throws if required vars missing.

**Alternatives:** Per-module validation (rejected: scattered, harder to audit); dotenv-only (rejected: no validation).

**Schema shape:** Include `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `DRIME_TOKEN` (optional for dev), `NOMINATIM_URL` (optional), etc. Use `z.string().min(1)` for required secrets.

### 2. ILocation.nominatim structure

**Choice:** Extend `nominatim` in shared `ILocation` to allow `{ address?: Record<string, string | undefined> }` while keeping backward compatibility. Use intersection or explicit optional `address` field.

**Rationale:** `getLocationParts` only needs `nominatim?.address` with string values. Server nominatim service already returns this shape. Narrow type in shared so client can use it without `as`.

### 3. MongoFilter typing

**Choice:** Define `MongoFilter` with optional `$nor?: object[]` and `$and?: object[]` in addition to index signature. Ensures `filter.$nor` and `filter.$and` are correctly typed when assigned.

### 4. Error type guards

**Choice:** Add `hasStatus(err: unknown): err is { status: number }` in server utils. Use `axios.isAxiosError` where applicable. For `getErrorMessage`, use `'data' in error` narrowing instead of assertion.

### 5. Photos upload/query schemas

**Choice:** Zod schemas in `server/src/routes/photos.ts` (or adjacent `photos.schema.ts`): `uploadBodySchema` for body (files come from multer, body fields validated), `photosQuerySchema` for query params. Parse at handler entry; return 400 on validation failure.

### 6. useQueryParams → PhotoSearch

**Choice:** Build `Record<string, string | string[]>` from URL (typed accumulator). Add `parsePhotoSearch(raw)` that validates/normalizes into `PhotoSearch` (zod or manual checks). Return parsed result or safe defaults; no `as PhotoSearch`.

### 7. Auth header helper

**Choice:** `getAuthHeader(req: Request): string | undefined` that returns `req.headers.authorization ?? req.headers.Authorization`, narrowed to `string` when truthy. Callers check truthy before use; no `as string`.

### 8. Cache middleware wrappedEnd

**Choice:** Ensure `wrappedEnd` matches `Response['end']` signature. Use `Parameters<typeof res.end>` and `ReturnType<typeof res.end>` if needed, or explicitly type the wrapper so assignment is valid without assertion.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Env parse fails at startup, breaking dev | Document required vars; provide `.env.example` with placeholders |
| Zod adds bundle size to server | Server is Node; zod is small; acceptable |
| ILocation change breaks consumers | Nominatim extension is additive; existing `Record<string, unknown>` still valid |
| Photos schema too strict | Start permissive; tighten iteratively |

## Migration Plan

1. Add zod to server; create `config/env.ts`; migrate auth, drime, optionalAuth, verifyJWT to use `env`
2. Update shared `ILocation`; remove assertions in `getLocationParts`
3. Update `MongoFilter` and queryBuilder
4. Add error guards; update photos routes, getErrorMessage, api.ts
5. Add photos schemas; update upload and GET handlers
6. Update useQueryParams with parsePhotoSearch
7. Add getAuthHeader; update optionalAuth, verifyJWT
8. Fix cache middleware wrappedEnd typing

No rollback needed; changes are internal. If env validation fails, fix `.env` and restart.

## Open Questions

- Should `DRIME_TOKEN` be required or optional (for local dev without Drime)?
- Any other env vars to include in the schema beyond auth and Drime?
