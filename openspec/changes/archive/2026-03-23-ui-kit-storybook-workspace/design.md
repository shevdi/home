## Context

The monorepo (`shevdi-home`) uses npm workspaces for `client`, `server`, `mock-server`, `e2e`, and `shared`. The client is React 19 with Webpack and `styled-components`; `ui-kit/` currently contains only a README describing intent (future npm package, Radix, Docker). There is no package manifest, Storybook, or build pipeline for a shared UI layer. The team wants Radix Themes as the reference stack, Storybook with HMR for development, and a clear rule that the app consumes **built** package output.

## Goals / Non-Goals

**Goals:**

- Add `ui-kit` as a first-class workspace package with dependencies isolated under `ui-kit/`.
- Run Storybook against the kit source with fast refresh / HMR for day-to-day component work.
- Produce a **deterministic build** (JS + types + any required CSS or styling contract) that `client` can import via workspace protocol (`file:`/`workspace:`).
- Align Docker usage with existing conventions: **dev** container(s) for a consistent Node environment and optional watch; **CI** using the same install/build commands so “works on my machine” matches CI.
- Document the two-loop workflow: Storybook → (build) → client.

**Non-Goals:**

- Publishing to npm or a private registry in the first iteration (design for it; do not require it).
- Full SSR or Next.js App Router integration in the first iteration (design notes only).
- Replacing `styled-components` in the client in one go; the kit may introduce Radix Themes alongside gradual adoption.
- GitHub Pages deployment of Storybook in the first cut (capture as follow-up; optional stub in CI only if trivial).

## Decisions

1. **Workspace package before registry**  
   **Choice:** Ship as `workspace:*` / `file:../ui-kit` style dependency until APIs stabilize.  
   **Rationale:** Matches current `shared` pattern; avoids semver churn early.  
   **Alternative:** `npm publish` to GitHub Packages immediately — rejected as premature.

2. **Storybook as the primary dev surface**  
   **Choice:** Author components and stories in Storybook; use HMR there.  
   **Rationale:** Fast feedback without rebuilding the client.  
   **Alternative:** Only app-level development — rejected (slow, noisy for pure UI).

3. **Client consumes built output**  
   **Choice:** Client resolves the package’s **dist** (or configured `main`/`exports`) after `npm run build` in `ui-kit`.  
   **Rationale:** Matches “real” publish flow and catches bundling issues early.  
   **Alternative:** TypeScript path alias to `ui-kit/src` in the client — faster HMR but diverges from production; optional dev-only shortcut later, not default.

4. **Optional watch build**  
   **Choice:** Provide `build --watch` (or equivalent) so developers can keep the client open while iterating without manual rebuilds.  
   **Rationale:** Bridges Storybook HMR and app integration without pretending they’re the same.

5. **Radix Themes stack**  
   **Choice:** Add `@radix-ui/themes` (and related Radix primitives as needed) in `ui-kit`; root Theme provider usage documented for Storybook and for client integration.  
   **Rationale:** README explicitly references Radix Themes as the reference stack.  
   **Alternative:** Headless primitives only — rejected for this README.

6. **Docker**  
   **Choice:** Add a dedicated Dockerfile (or extend compose with a `ui-kit` service) that installs `ui-kit` deps and runs Storybook dev and/or build; mirror the same commands in CI.  
   **Rationale:** Matches stated “own container” intent and existing `docker-compose.dev.yml` pattern.  
   **Alternative:** Docker-only CI — rejected; local non-Docker dev must remain possible.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Storybook environment differs from Webpack client (different CSS order, aliases) | Smoke-test critical components in the client after build; keep stories close to real usage (providers, theme). |
| Radix Themes + existing `styled-components` styling overlap | Scope first components to kit boundaries; document theme wrapping for app shell. |
| Build/watch forgotten → app shows stale UI | Document workflow in README; optional npm script at root to run Storybook + watch-build. |
| Docker volume/watch performance on Windows | Use polling flags if needed (pattern already used for `home-frontend`). |

## Migration Plan

1. Land `ui-kit` package + Storybook + build scripts without changing client imports (or a single trivial import to validate wiring).
2. Add `ui-kit` to root `workspaces` and client dependency; run `npm install` at repo root.
3. Point client at built output; add `ui-kit` build to root `build` or document order (`build ui-kit` then `build client`).
4. Add Docker service / CI job when the local path is stable.

**Rollback:** Remove workspace entry and client dependency; delete `ui-kit` artifacts. No data migration.

## Open Questions

- Exact bundler for the library (tsup, vite library mode, unbuild) — pick per ecosystem fit and Webpack consumer compatibility.
- Whether to colocate Storybook inside `ui-kit` or minimal — default is colocated.
- Peer dependency matrix for React (`react` / `react-dom` peers from client vs bundled) — decide during implementation to avoid duplicate React.
