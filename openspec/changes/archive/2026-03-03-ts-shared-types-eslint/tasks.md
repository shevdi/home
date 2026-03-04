## 1. Shared Package Setup

- [x] 1.1 Add `shared/package.json` with name `@shevdi-home/shared`, exports pointing to `./types/index.ts`
- [x] 1.2 Fix `descriptopn` → `description` typo in `shared/types/photos.ts`
- [x] 1.3 Add `workspaces` to root `package.json`: `["client", "server", "mock-server", "e2e", "shared"]`
- [x] 1.4 Run `npm install` at root to link workspace packages

## 2. Consuming Packages - Dependencies

- [x] 2.1 Add `@shevdi-home/shared: "workspace:*"` to client `package.json` dependencies
- [x] 2.2 Add `@shevdi-home/shared: "workspace:*"` to server `package.json` dependencies
- [x] 2.3 Add `@shevdi-home/shared: "workspace:*"` to mock-server `package.json` dependencies
- [x] 2.4 Add `@shevdi-home/shared: "workspace:*"` to e2e `package.json` dependencies

## 3. Consuming Packages - Update Imports

- [x] 3.1 Update client imports from `@/shared/types/common/*` or local paths to `@shevdi-home/shared`
- [x] 3.2 Remove `client/src/shared/types/common/` directory (or redirect to shared)
- [x] 3.3 Update server imports from `./types/common/*` to `@shevdi-home/shared`
- [x] 3.4 Remove `server/src/types/common/` directory
- [x] 3.5 Update mock-server imports to use `@shevdi-home/shared` if it uses shared types
- [x] 3.6 Update e2e imports to use `@shevdi-home/shared` for photo/link types where applicable

## 4. Remove Copy Step

- [x] 4.1 Remove `copy:types` script from root `package.json`
- [x] 4.2 Remove `copyFiles` config from root `package.json`
- [x] 4.3 Remove or deprecate `scripts/copyFiles.cjs`
- [x] 4.4 Remove any `copy:types` from build/dev scripts (e.g. prebuild hooks)

## 5. Quick Wins - Client api.ts

- [x] 5.1 Replace `(getState() as any).auth?.token` with `(getState() as RootState).auth?.token` in `client/src/app/store/api.ts`
- [x] 5.2 Add RTK Query types to `baseQueryWithReauth` (use `BaseQueryFn`, `BaseQueryApi` types from RTK Query)
- [x] 5.3 Replace `(refreshResult.error as any).data.message` with proper typing or type assertion

## 6. ESLint - Server

- [x] 6.1 Add `eslint.config.ts` to server with @eslint/js, typescript-eslint recommended
- [x] 6.2 Add `lint` script to server `package.json`: `"lint": "eslint src"`
- [x] 6.3 Add eslint and typescript-eslint devDependencies to server

## 7. ESLint - Mock-server

- [x] 7.1 Add `eslint.config.ts` to mock-server with @eslint/js, typescript-eslint recommended
- [x] 7.2 Add `lint` script to mock-server `package.json`
- [x] 7.3 Add eslint and typescript-eslint devDependencies to mock-server

## 8. ESLint + TS - E2E

- [x] 8.1 Add `e2e/tsconfig.json` (extend base or minimal config for Playwright)
- [x] 8.2 Add `eslint.config.ts` to e2e with typescript-eslint
- [x] 8.3 Add `lint` script to e2e `package.json`
- [x] 8.4 Add eslint and typescript-eslint devDependencies to e2e

## 9. Drime API Types

- [x] 9.1 Replace `data?: any` in `DrimeTokenApiResponse` with `data?: unknown` (or concrete type if known)
- [x] 9.2 Replace `request: any` in `DrimeTokenApiResponse` with `request?: unknown` or remove if unused
- [x] 9.3 Audit drime.ts service for any remaining `any` usage; add explicit types or `unknown`

## 10. Root Typecheck

- [x] 10.1 Update root `typecheck` script to run client typecheck: `npm run typecheck --prefix client` (or fix react-router typegen path)
- [x] 10.2 Verify `npm run typecheck` from root succeeds
