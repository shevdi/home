## Context

The repository uses **npm workspaces** (`client`, `server`, `ui-kit`, etc.). Root `package.json` builds ui-kit before the client via chained scripts. **`@shevdi-home/ui-kit`** is consumed by the client through `file:../ui-kit` and built **Vite library output** (`dist/`). ui-kit already exposes `build:watch` (`vite build --watch`). The client uses **webpack-dev-server** with `watchFiles` limited to client `src/**/*` and polling for Docker.

**Constraints:** Stay on npm (not migrating to pnpm unless separately decided); Windows and Docker dev environments matter for file watching; minimize churn to server/e2e unless a shared `turbo` pipeline clearly benefits them.

## Goals / Non-Goals

**Goals:**

- Install **Turborepo** at the monorepo root and define **`turbo.json`** tasks so `build` respects package dependencies (`^build`) where Turbo models the graph.
- Provide a **single documented root command** that runs **ui-kit `build:watch`** in parallel with **client `dev`** (webpack serve).
- Preserve or improve **deterministic ordering** for production builds (ui-kit before client).
- Verify and, if necessary, fix **client rebuild** when `ui-kit/dist` changes during dev.

**Non-Goals:**

- Replacing npm workspaces with pnpm/yarn.
- Changing ui-kit’s public API, Vite config, or Storybook setup except where required for script names.
- Mandatory CI migration to `turbo` in this change (may remain a follow-up).
- Turborepo Remote Cache configuration (local cache only unless the team opts in later).

## Decisions

| Decision | Choice | Rationale | Alternatives considered |
|----------|--------|-----------|---------------------------|
| Task runner | **Turborepo** at root | Caching, `^build` semantics, and parallel tasks align with “orchestrate ui-kit + client” without custom scripting only. | **npm-run-all / concurrently only** — simpler but no graph-aware build cache or unified `turbo run`. |
| Dev orchestration | **Root script** using **`concurrently`** (already in root deps) to run `ui-kit` `build:watch` + `client` `dev` | Matches existing root pattern (`dev` runs server + client); persistent processes are explicit. | **Turbo-only `dev`** — Turbo supports persistent tasks, but two-package dev is often clearer as `concurrently` until all packages have a `dev` script. |
| `build` entry | **`turbo run build`** from root with workspace `build` scripts | Single command; Turbo runs `ui-kit` build before `client` when `dependsOn: ["^build"]` is set on consumer packages. | Keep raw `npm run build:ui-kit && npm run build --prefix client` — works but duplicates graph knowledge in scripts. |
| Watch + HMR | **ui-kit watch writes `dist/`**; client bundles **prebuilt** output | Matches current `package.json` `main`/`exports` and `ts-loader` excluding `node_modules` sources. | **Alias ui-kit to `src/`** in webpack for dev — faster feedback but diverges from production resolution and needs more webpack/tsconfig rules. |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Webpack does not rebuild when `../ui-kit/dist` changes | Extend `devServer.watchFiles` (and/or `snapshot.managedPaths`) to include the resolved ui-kit `dist` path; test on Windows. |
| Turbo + npm workspaces quirks on Windows | Use paths and scripts that work with `npm exec` / `npx turbo`; document Node version. |
| Duplicate “dev” concepts (Turbo vs concurrently) | Document one primary command (e.g. `npm run dev:client` or `turbo run dev --filter=...`) in proposal follow-up tasks. |

## Migration Plan

1. Add `turbo` devDependency and `turbo.json`.
2. Wire root `build` (and optionally `typecheck`) to `turbo run ...` while keeping individual workspace scripts unchanged.
3. Add `dev:client` (name TBD in tasks) running ui-kit watch + client dev.
4. Manually verify: edit ui-kit component → client hot-reloads or recompiles as expected.
5. Optional later: switch CI install/build step to `turbo run build` for parity.

## Open Questions

- Whether **server** `build` should join the Turbo pipeline immediately or stay invoked only by existing `dev`/`start` scripts.
- Whether to enable **Turborepo** for **lint** / **test** tasks in the same change or defer.

## Docker dev (`home-frontend` + ui-kit) — follow-up

**Current behavior (ground truth):**

- `home-frontend` Compose **`develop.watch`** syncs **`./client` → `/app`** only; **`./ui-kit` is not** synced into that service. ui-kit is **baked into the image** at build time.
- Plain **`docker compose up`** (as in `npm run docker:up:dev`) does **not** activate Compose Develop sync; **`docker compose watch`** (or documented equivalent) is needed for `develop.watch` paths to apply.
- The **`home-ui-kit`** service runs **Storybook** on port 6006 with its **own** ui-kit sync — it does **not** feed **`home-frontend`** (3000).
- The client imports ui-kit **`dist/`**; **`home-frontend`** runs webpack dev only — no **vite `build:watch`** for ui-kit unless we add it (second process or changed `CMD`).

```text
  host: edit ui-kit
       │
       ├─► home-ui-kit (6006)     Storybook — sees synced ui-kit
       │
       └─► home-frontend (3000)   SPA — needs synced ui-kit + build:watch
                                  for dist/ to update; today: gap
```

**Design options (pick one or combine):**

| Option | Pros | Cons |
|--------|------|------|
| **A. Document host-first** | No image changes; `npm run dev:client` + Docker backend only | Split mental model |
| **B. Sync `ui-kit` + run `build:watch` in `home-frontend`** | One stack in Compose | Larger Dockerfile/CMD; resource use |
| **C. Rebuild `home-frontend` on ui-kit changes** | Simple | Slow loop |

**Recommended direction for implementation tasks:** add **`develop.watch`** for `./ui-kit` → container path consistent with `node_modules/@shevdi-home/ui-kit` / `../ui-kit`; set **`CMD`** (or compose `command`) to **`concurrently`** ui-kit `build:watch` + client `dev` (mirror root `dev:client`); document **`docker compose watch`** vs **`up`**. Validate **`CHOKIDAR_USEPOLLING`** / existing webpack **`watchFiles`** for `ui-kit/dist` inside the container.
