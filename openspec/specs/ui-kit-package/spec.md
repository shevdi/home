# UI Kit Package

## Purpose

Define requirements for the `@shevdi-home/ui-kit` workspace package: headless Radix UI primitives with project CSS, Storybook with HMR, production build consumed by the client, Docker/CI alignment, and room to grow toward publish, multi-app, and SSR.
## Requirements
### Requirement: Ui-kit workspace package

The repository SHALL include an npm workspace package named `ui-kit` (or equivalent documented name) under `ui-kit/` with its own `package.json`, dependencies, and scripts that can be installed and built independently of the client application.

#### Scenario: Install from workspace root

- **WHEN** a developer runs the root package manager install at the monorepo root
- **THEN** the `ui-kit` package dependencies are installed and the package is resolvable by workspace-aware tooling

### Requirement: Storybook development with HMR

The `ui-kit` package SHALL provide a Storybook setup for developing components with hot module replacement (or equivalent fast refresh) such that changes to component source files update in the browser without a full manual restart under normal development.

#### Scenario: Storybook dev script

- **WHEN** a developer runs the documented Storybook development command from `ui-kit`
- **THEN** Storybook starts and serves development builds with HMR or fast refresh enabled

### Requirement: Production build artifact

The `ui-kit` package SHALL expose a build script that produces output suitable for consumption by the client bundler (including JavaScript modules and TypeScript declarations; CSS handling SHALL match **project CSS modules**, **Radix primitive** dependencies, and the chosen bundler so styles apply correctly in the app).

#### Scenario: Build succeeds cleanly

- **WHEN** a developer runs the ui-kit production build command
- **THEN** the build completes without errors and emits artifacts at the declared output paths

### Requirement: Client consumes built package

The client application SHALL depend on the `ui-kit` workspace package and SHALL import public APIs from the built entry points defined by `ui-kit` (not from Storybook-only modules). Integrating or updating ui-kit in the running client SHALL require running the ui-kit build (or a documented watch-build) so the client sees updated code.

#### Scenario: Build before client sees changes

- **WHEN** a developer changes ui-kit source and wants those changes reflected in the client application without using Storybook
- **THEN** they MUST run the ui-kit build (or continuous watch build) as documented before the client bundle includes the changes

### Requirement: Docker and CI alignment

The project SHALL document and implement Docker-based workflows for `ui-kit` such that: (1) developers can run Storybook and/or build in a container consistent with the chosen Node image; and (2) continuous integration runs the same install and build commands (or equivalent) so CI validates the ui-kit package build. GitHub Pages deployment of Storybook MAY be added in a follow-up once the static Storybook build is stable.

#### Scenario: CI validates ui-kit build

- **WHEN** CI runs on a change that affects `ui-kit`
- **THEN** the pipeline SHALL execute the ui-kit install and build steps and fail if the build fails

### Requirement: Future extensibility

The design and package layout SHALL NOT preclude: publishing `ui-kit` to an npm registry later; consuming the package from multiple applications; or adding SSR-specific considerations in a future change. The initial implementation MAY scope only to the current SPA client.

#### Scenario: Documentation mentions evolution

- **WHEN** a reader consults the ui-kit documentation in the repository
- **THEN** the documentation SHALL state that registry publish, multi-app usage, and SSR are planned extensions rather than guaranteed first-scope deliverables

### Requirement: Headless Radix UI primitives for interactive controls

The `ui-kit` package SHALL use **headless** Radix UI primitives (e.g. `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-slot` or `@radix-ui/react-primitive` as appropriate) for interactive controls refactored under this capability, styled with the project’s **CSS modules** (or equivalent documented styling). **`@radix-ui/themes`** SHALL NOT be required for these controls to function or render correctly in the client or in Storybook stories that target only these primitives.

#### Scenario: Storybook without Theme for headless stories

- **WHEN** Storybook renders a story for a component built solely from headless Radix primitives and project CSS
- **THEN** the story SHALL NOT require wrapping content in a Radix Themes `Theme` provider for correct behavior or layout of that component

#### Scenario: Optional Themes for legacy or mixed stories

- **WHEN** a story or application screen still depends on Radix Themes for unrelated reasons
- **THEN** wrapping with a Themes provider remains allowed and SHALL NOT conflict with headless form-field components

### Requirement: Storybook documents exported components

The ui-kit package SHALL maintain Storybook stories such that every component exported from the package’s public entry (`ui-kit/src/index.ts` after each release-quality change) has at least one story file demonstrating that component, except where explicitly documented as Storybook-excluded (e.g. pure re-exports with no distinct UI).

#### Scenario: New export gets a story in the same change set

- **WHEN** a change adds a new component to the public `index.ts` export list
- **THEN** that change set SHALL include or update Storybook stories so the new export is visible in Storybook before merge, unless the change’s proposal documents an intentional exclusion

### Requirement: Avoid application routing inside reusable components

Components in the ui-kit package that are intended for general reuse SHALL NOT depend on application-specific routers (e.g. `react-router` navigation components) in their default implementation files; routing integration SHALL be composed in application or feature code unless an exception is recorded in the package documentation and approved for that component.

#### Scenario: Reusable component source has no router import

- **WHEN** a reviewer inspects a ui-kit component marked as reusable in documentation
- **THEN** its primary source file SHALL NOT contain imports from `react-router` or `react-router-dom`, except for documented exceptions listed in the ui-kit README or design docs

