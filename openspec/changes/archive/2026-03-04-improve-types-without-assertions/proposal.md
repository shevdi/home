# Improve Types Without Assertions

## Why

The codebase uses many `as` type assertions, which bypass TypeScript's type checker and can hide runtime errors. Replacing them with proper typing (type guards, validated config, schema-based parsing) improves safety and maintainability. High and medium priority improvements focus on env config, shared types, error handling, and request parsing.

## What Changes

- **Typed env config**: Replace `process.env.X as string` with a zod-validated config object loaded at startup. Server fails fast if required env vars are missing.
- **Shared types**: Extend `ILocation.nominatim` in `@shevdi-home/shared` so `getLocationParts` no longer needs assertions. Tighten `MongoFilter` in server utils so `queryBuilder` avoids `$nor`/`$and` assertions.
- **Error type guards**: Add `hasStatus(err)` and use `axios.isAxiosError` where applicable. Replace `(err as { status?: number })?.status` and similar patterns with type guards.
- **Express body/query parsing**: Add zod schemas for photos upload body and query params. Replace `req.body?.private as string` and `<string>req.query.page` with validated parsing.
- **useQueryParams**: Parse URL params into `PhotoSearch` via validation instead of assertion.
- **Auth header helper**: Extract `getAuthHeader(req)` that narrows type without `as string`.
- **cache middleware**: Type `wrappedEnd` so it satisfies `res.end` without assertion.

## Capabilities

### New Capabilities

- `typed-env-config`: Server and services load env from a zod-validated config. Required vars are checked at startup; no `as string` on process.env.

### Modified Capabilities

- `shared-types-package`: `ILocation.nominatim` gains optional `address?: Record<string, string | undefined>` structure so `getLocationParts` can use it without assertions.

## Impact

- **Server**: New `config` module, updates to auth, drime, optionalAuth, verifyJWT, photos routes, queryBuilder, cache middleware.
- **Client**: useQueryParams, getErrorMessage.
- **Shared**: ILocation type in links.ts.
- **Dependencies**: Add `zod` to server package (client already has it).
