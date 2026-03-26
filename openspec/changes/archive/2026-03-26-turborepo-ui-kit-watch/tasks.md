## 1. Turborepo installation and configuration

- [x] 1.1 Add `turbo` as a root `devDependency` (pin to a current stable major compatible with the repo’s Node/npm).
- [x] 1.2 Add `turbo.json` (or `turbo.jsonc`) at the repository root with a `build` pipeline: appropriate `dependsOn` (e.g. `^build` for dependents), `outputs` for packages that emit `dist/` (ui-kit, client as applicable), and `cache` settings consistent with production builds.
- [x] 1.3 Ensure each workspace that participates in `turbo run build` exposes a `build` script in its `package.json` (ui-kit and client already do; confirm others only if included in scope).

## 2. Root scripts

- [x] 2.1 Replace or supplement the root `build` script to use `turbo run build` (or `turbo run build --filter=...` if narrowing scope) while preserving ui-kit-before-client ordering for the client app.
- [x] 2.2 Add a root script (e.g. `dev:client` or `dev:app`) that uses `concurrently` to run `@shevdi-home/ui-kit` `build:watch` and `client` `dev` with clear process prefixes in the console.
- [x] 2.3 Keep existing `dev` (server + client) behavior unchanged unless the team explicitly wants a single entry that also starts ui-kit watch—document the distinction.

## 3. Client dev watching

- [x] 3.1 Manually verify that editing ui-kit source with `build:watch` running updates the client without restarting webpack; if not, extend `client` webpack dev config (`watchFiles`, `snapshot`, or symlink-aware options) so `dist/` changes under the linked ui-kit path trigger a rebuild.
- [x] 3.2 Re-verify with polling-friendly settings if developers use Docker bind mounts (align with existing `usePolling` where needed).

## 4. Documentation

- [x] 4.1 Document the combined ui-kit watch + client dev command in the root README (or CONTRIBUTING): when to use it vs Storybook, and that the client consumes built output.
- [x] 4.2 Optionally document `turbo run build` for contributors and note CI adoption as a follow-up if not switched in this change.

## 5. Validation

- [x] 5.1 Run root `build` (via turbo) locally and confirm client production build succeeds.
- [x] 5.2 Run the new combined dev script and smoke-test a ui-kit change visible in the client.

## 6. Docker dev — ui-kit visible in client (follow-up)

- [x] 6.1 Document **`docker compose up`** vs **`docker compose watch`** for `develop.watch` sync in [README](README.md) or a short Docker dev section (and how it relates to `npm run docker:up:dev`).
- [x] 6.2 Add **`develop.watch`** sync for **`./ui-kit`** into **`home-frontend`** at the path where the workspace package resolves inside the container (e.g. `/app/ui-kit`), or document why not and keep Storybook-only / host `dev:client` as the official loop.
- [x] 6.3 Run **ui-kit `build:watch`** alongside webpack in **`home-frontend`** (e.g. `concurrently` in `CMD` / compose `command`, mirroring root `dev:client`), or explicitly document that Docker users should run **`npm run dev:client` on the host** while Compose runs backend services only.
- [x] 6.4 Manually verify: edit ui-kit on host → **`dist/`** updates in container → client on **3000** rebuilds (with polling as needed).
