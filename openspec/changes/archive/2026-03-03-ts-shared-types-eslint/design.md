# Design: TypeScript Shared Types & ESLint

## Context

- **Current state**: `shared/types` is copied via `copy:types` into `client/src/shared/types/common` and `server/src/types/common`. Client extends `IPhotoSearch` locally. mock-server and e2e have no shared types. ESLint exists only for client.
- **Constraints**: Docker builds must include shared types. Client uses webpack/bundler, server uses Node ESM with `--experimental-transform-types`. Type strictness stays the same (no `noUncheckedIndexedAccess` etc.).
- **Stakeholders**: All packages (client, server, mock-server, e2e) consume or will consume shared types.

## Goals / Non-Goals

**Goals:**
- Single source of truth for shared types via npm workspace package
- ESLint + TypeScript linting on server, mock-server, e2e
- Proper types for Drime API responses (no `any`)
- Quick wins: typo fix, RootState usage, RTK Query types
- Root typecheck script works

**Non-Goals:**
- Changing TypeScript strictness (no new compiler options)
- Migrating to pnpm/yarn workspaces (stay with npm)
- Adding ESLint to client (already has it)

## Decisions

### 1. Shared package structure: workspace package at `shared/`

**Choice**: Add `shared/package.json` with `"name": "@shevdi-home/shared"`, expose `./types` via exports. Add `shared` to root `workspaces`.

**Alternatives**:
- Path references only: Simpler but different import paths per package, bundler resolution quirks.
- Dedicated `packages/shared-types`: More structure but unnecessary for current size.

**Rationale**: Minimal change to existing layout; `shared/` already exists. npm workspaces give consistent `@shevdi-home/shared` import path everywhere.

### 2. Package exports

**Choice**: `"exports": { ".": "./types/index.ts" }` with `"types"` and `"main"` pointing to same. No build step for types-only package.

**Rationale**: TypeScript and Node resolve `.ts` directly when supported. Keeps shared package zero-build.

### 3. ESLint config strategy

**Choice**: Each package (server, mock-server, e2e) gets its own `eslint.config.ts` (flat config). Base: `@eslint/js`, `typescript-eslint` recommended. No React plugins for server/mock-server/e2e.

**Alternatives**:
- Single root eslint config: Would need overrides per package; harder to run `lint` per package.
- Shared base config package: Overkill for 3 packages.

**Rationale**: Mirrors client setup (flat config), simple per-package `npm run lint`.

### 4. Drime API typing

**Choice**: 
- `DrimeTokenApiResponse.data`: Type as `unknown` (API shape not fully documented; we only use `user.access_token`).
- `DrimeTokenApiResponse.request`: Type as `unknown` or omit if unused. Inspect usage first; if unused, remove from interface.

**Rationale**: Avoid `any`; `unknown` forces explicit narrowing. If we discover the shape later, we can refine.

### 5. Root typecheck

**Choice**: `"typecheck": "npm run typecheck --prefix client"` (or `npm run typecheck --workspaces --if-present` if we want all packages). Client is the primary consumer; server uses `--experimental-transform-types` without tsc in dev.

**Rationale**: Root script should work from any cwd. Delegate to client for now; can extend to workspace-wide later.

### 6. Client IPhotoSearch extension

**Choice**: Keep client-specific `IPhotoSearch` extensions (`dateFrom`, `dateTo`, `order`) in client. Shared package exports base `IPhotoSearch`; client re-exports or extends locally.

**Rationale**: Server/API doesn't need UI-specific params. Avoids bloating shared types.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Docker build context missing `shared/` | Ensure Dockerfiles copy monorepo root or `shared/` into build context |
| `npm install` at root required after workspace add | Document in README; add to `package.json` scripts if needed |
| ESLint rules may flag existing code | Start with `recommended` only; fix critical issues; use `warn` for `no-explicit-any` initially if needed |
| Drime API shape changes | Use `unknown`; narrow only where we consume; document assumptions |

## Migration Plan

1. Add `shared/package.json`, add `workspaces` to root.
2. Run `npm install` at root.
3. Add `@shevdi-home/shared` to client, server, mock-server, e2e.
4. Update imports in each package from local paths to `@shevdi-home/shared`.
5. Remove copied type directories and `copy:types` script.
6. Add ESLint configs to server, mock-server, e2e.
7. Add e2e `tsconfig.json` if needed.
8. Update Drime types.
9. Apply quick wins (typo, RootState, RTK types).
10. Fix root typecheck script.
11. Remove or deprecate `scripts/copyFiles.cjs`.

**Rollback**: Revert to copy-based approach; restore `copy:types`; remove workspace deps.

## Open Questions

- None. Proceed to implementation.
