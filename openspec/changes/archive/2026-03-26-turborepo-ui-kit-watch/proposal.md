## Why

The monorepo already uses npm workspaces and sequential root scripts (`build:ui-kit` then client build), but there is no task runner for parallel work, cacheable pipelines, or a single documented command to run **ui-kit watch** alongside the **client dev server**. Adding Turborepo and explicit dev orchestration reduces friction when iterating on `@shevdi-home/ui-kit` from the client and aligns root `build`/`dev` with dependency order across packages.

## What Changes

- Add **Turborepo** (`turbo`) as a root dev dependency and introduce **`turbo.json`** (or `turbo.jsonc`) defining tasks for `build` (with `^build` dependency ordering where applicable) and persistent `dev`-style tasks as needed.
- Add **root npm scripts** so developers can run **ui-kit library watch** (`vite build --watch`) **together with** the client webpack dev server (e.g. via `concurrently`, matching existing patterns).
- Optionally migrate root **`build`** (and any documented CI/local equivalents) to **`turbo run build`** where it preserves the same outcomes (ui-kit builds before client when required).
- **Document** the workflow in a discoverable place (e.g. root README or contributing snippet) so "change ui-kit → see client update" is explicit.
- Adjust **client dev** configuration only if needed so file watching picks up changes under the linked `ui-kit` `dist/` output (e.g. `devServer.watchFiles` or webpack snapshot options) — only if validation shows gaps on Windows/Docker.

**Follow-up (Docker dev):** Make it possible (or clearly documented) to see **ui-kit** edits in the **client served from Docker** (`home-frontend`): sync host `ui-kit/` into the frontend container (Compose `develop.watch`), run **ui-kit `build:watch`** alongside webpack inside that container (or document that **`npm run dev:client` on the host** is the supported loop when Docker runs only backend/DB). Clarify **`docker compose up`** vs **`docker compose watch`** for live sync.

## Capabilities

### New Capabilities

- `turborepo-workspace`: Turborepo installation, workspace task definitions (`turbo.json`), root scripts for orchestrated `build` and `dev` (ui-kit watch + client dev), and documentation of the local workflow.

### Modified Capabilities

- *(none)* — Existing `ui-kit-package` and `ci-workflow` requirements already allow a watch build and do not mandate a specific task runner; this change adds orchestration without altering those behavioral contracts unless CI explicitly adopts `turbo` in a follow-up.

## Impact

- **Root** `package.json` (scripts, `devDependencies` for `turbo`).
- **New** `turbo.json` at repository root.
- **client** `webpack.dev.ts` (or related) only if watch gaps are confirmed.
- **Developer workflow**: one command for "full stack" front dev with ui-kit; CI may continue using existing `npm run build` until optionally switched to `turbo run build` in a separate change.
- **Docker**: `docker-compose.dev.yml`, `client/Dockerfile.dev`, root `docker:up:dev` / `docker compose watch` docs — extend or document so ui-kit → client visibility matches expectations.
