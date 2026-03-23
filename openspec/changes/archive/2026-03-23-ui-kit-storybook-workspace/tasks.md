## 1. Package scaffold

- [x] 1.1 Add `ui-kit/package.json` with name, scripts placeholder, peer deps for React, and dependencies for `@radix-ui/themes` (and required Radix primitives)
- [x] 1.2 Register `ui-kit` in root `package.json` `workspaces` and run install so the workspace resolves
- [x] 1.3 Add minimal `ui-kit` source entry (e.g. `src/index.ts`) exporting a placeholder or first primitive; add `tsconfig` aligned with the repo

## 2. Storybook

- [x] 2.1 Install and configure Storybook for React/TypeScript in `ui-kit` with Radix Themes provider in preview
- [x] 2.2 Add at least one story proving HMR/fast refresh for a kit component
- [x] 2.3 Document the Storybook dev command in `ui-kit/README.md`

## 3. Library build

- [x] 3.1 Choose and configure the library bundler (e.g. tsup/vite/unbuild) with `main`/`module`/`types` or `exports` map pointing to dist
- [x] 3.2 Implement `build` script producing JS + d.ts (+ CSS strategy per Radix Themes)
- [x] 3.3 Add optional `build:watch` (or equivalent) for local iteration when testing in the client

## 4. Client integration

- [x] 4.1 Add `ui-kit` as a workspace dependency of `client` and wrap or configure app root if a Radix Themes provider is required app-wide
- [x] 4.2 Import a component or token from the built `ui-kit` entry in the client (smoke test)
- [x] 4.3 Ensure root `build` (or documented script order) builds `ui-kit` before `client` where required

## 5. Docker and CI

- [x] 5.1 Add Dockerfile and/or `docker-compose.dev.yml` service for `ui-kit` (Storybook dev and/or build) consistent with design
- [x] 5.2 Add CI job step(s) to install and build `ui-kit` on relevant changes

## 6. Documentation

- [x] 6.1 Expand `ui-kit/README.md` with workspace vs future publish, Storybook vs client build workflow, and pointers to SSR/multi-app as future work
