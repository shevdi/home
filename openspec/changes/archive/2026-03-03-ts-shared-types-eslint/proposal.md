# TypeScript Shared Types & ESLint

## Why

The project uses a copy-based approach for shared types (`copy:types` script) and lacks ESLint/TypeScript linting on server, mock-server, and e2e. This creates drift risk, manual sync burden, and inconsistent code quality across packages. Replacing copyFiles with a proper shared package and adding ESLint+TS to all packages improves maintainability and catches issues earlier.

## What Changes

- **Replace copyFiles with shared package**: Convert `shared/types` into an npm workspace package consumed by client, server, mock-server, and e2e. Remove `copy:types` script and `copyFiles` config.
- **Quick wins**: Fix `descriptopn` → `description` typo in shared types. Use `RootState` in client `api.ts` instead of `(getState() as any)`. Add RTK Query types to `baseQueryWithReauth`.
- **Add ESLint + TS to server, mock-server, e2e**: Introduce ESLint configs (flat format, typescript-eslint) for each package. Add `tsconfig.json` for e2e if missing.
- **Type Drime API responses**: Replace `data?: any` and `request: any` in `DrimeTokenApiResponse` with proper types or `unknown` where shape is unknown.
- **Fix root typecheck**: Ensure `npm run typecheck` runs correctly (from client or via workspace).

## Capabilities

### New Capabilities

- `shared-types-package`: npm workspace package at `shared/` exposing types for client, server, mock-server, and e2e. Single source of truth, no copy step.
- `eslint-ts-backend`: ESLint + TypeScript linting for server, mock-server, and e2e packages. Flat config, typescript-eslint recommended.
- `drime-api-types`: Properly typed Drime API response interfaces; replace `any` in `DrimeTokenApiResponse` and related usage.

### Modified Capabilities

- (none)

## Impact

- **Root package.json**: Add `workspaces`, remove `copyFiles` and `copy:types` script.
- **shared/**: Add `package.json`, become workspace package.
- **client/**: Add dependency on `@shevdi-home/shared`, remove copied types, update imports.
- **server/**: Add dependency on `@shevdi-home/shared`, remove copied types, add ESLint config, update imports.
- **mock-server/**: Add dependency on `@shevdi-home/shared`, add ESLint config, update imports.
- **e2e/**: Add dependency on `@shevdi-home/shared`, add `tsconfig.json`, add ESLint config, update imports.
- **server/src/types/api/drime.ts**: Replace `any` with concrete or `unknown` types.
- **scripts/copyFiles.cjs**: Remove (or deprecate).
