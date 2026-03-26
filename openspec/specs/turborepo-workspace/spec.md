# Turborepo workspace

## Purpose

Define requirements for Turborepo at the monorepo root and for documenting and scripting **ui-kit watch** together with **client dev**, including Docker Compose dev documentation for the ui-kit → client loop.

## Requirements

### Requirement: Turborepo is installed and configured at the repository root

The repository SHALL include the `turbo` CLI as a **development** dependency of the root workspace package and SHALL include a Turborepo configuration file (`turbo.json` or `turbo.jsonc`) at the repository root that declares pipeline tasks for workspace packages.

#### Scenario: Developer installs dependencies at root

- **WHEN** a developer runs the root package manager install
- **THEN** the `turbo` package is available for invocation via `npx turbo` or an equivalent documented npm script

#### Scenario: Configuration file exists

- **WHEN** a reader inspects the repository root
- **THEN** a valid Turborepo configuration file exists and defines at least a `build` task used for orchestrating workspace builds

### Requirement: Build task ordering respects workspace dependencies

The Turborepo `build` task configuration SHALL ensure that when building packages that depend on `@shevdi-home/ui-kit`, the ui-kit package build completes before the dependent package build in the same `turbo run build` invocation (using `dependsOn` / graph semantics consistent with Turborepo’s `^build` pattern for dependencies).

#### Scenario: Client build runs after ui-kit build

- **WHEN** a developer runs the documented root command that executes Turborepo `build` for the workspaces that include the client and ui-kit
- **THEN** the ui-kit `build` for that run completes successfully before the client `build` starts

### Requirement: Documented combined development workflow for ui-kit and client

The project SHALL document a single primary workflow command (exposed as a root `package.json` script or clearly named scripts) that runs **both** the ui-kit library watch build (`vite build --watch` or the package’s `build:watch` script) **and** the client development server in parallel, such that developers iterating on ui-kit source can refresh the client without manually starting each process in separate terminals—subject to the existing constraint that the client consumes the **built** ui-kit output.

#### Scenario: Developer runs documented combined dev command

- **WHEN** a developer runs the documented root command for combined ui-kit watch and client dev
- **THEN** both processes start and remain running until stopped, and the documentation states that ui-kit changes require the watch build to write to `dist/` for the client to pick them up

### Requirement: File watching includes ui-kit build output for client dev

Where the client bundler or dev server configuration would otherwise fail to rebuild when files under the linked ui-kit **`dist/`** output change, the implementation SHALL adjust configuration (for example `devServer.watchFiles`, webpack snapshot options, or equivalent) so that a successful ui-kit watch rebuild triggers a client rebuild or hot update on supported developer environments (including Windows), without requiring a manual restart of the client dev server for typical edits.

#### Scenario: Dist change triggers client update

- **WHEN** the ui-kit watch build writes updated artifacts under the package `dist/` path consumed by the client
- **THEN** the running client development workflow reflects those changes without requiring the developer to manually restart the client dev server in the common case

### Requirement: Docker-based development documents the ui-kit to client loop

The project SHALL document the relationship between **Docker Compose dev** (`docker-compose.dev.yml`), **`home-frontend`**, **`home-ui-kit`**, and editing **ui-kit** source such that a developer understands: (1) whether **`docker compose up`** alone syncs host files into containers or whether **`docker compose watch`** (or equivalent) is required for `develop.watch` sync; (2) that **`home-frontend`** by default syncs **`client`** only and that seeing ui-kit changes in the SPA may require additional sync, a **watch build** of ui-kit, or using the documented **host** workflow (`dev:client`); (3) that **`home-ui-kit`** (Storybook) is for isolated component development and does not replace the client bundle on port 3000.

#### Scenario: README or Docker-oriented doc explains Compose watch and ui-kit

- **WHEN** a developer reads the documented Docker development instructions
- **THEN** they can choose a supported path to iterate on ui-kit and see results either in Storybook, in the client via a documented host command, or—if implemented—in **`home-frontend`** with sync and watch build as described

#### Scenario: Optional implementation is discoverable

- **WHEN** the repository adds Compose sync for `ui-kit` into `home-frontend` and/or a container command that runs ui-kit `build:watch` with the client dev server
- **THEN** those steps are referenced from the same documentation so the behavior is intentional and not ambiguous
