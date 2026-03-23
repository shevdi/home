## ADDED Requirements

### Requirement: Ui-kit workspace package

The repository SHALL include an npm workspace package named `ui-kit` (or equivalent documented name) under `ui-kit/` with its own `package.json`, dependencies, and scripts that can be installed and built independently of the client application.

#### Scenario: Install from workspace root

- **WHEN** a developer runs the root package manager install at the monorepo root
- **THEN** the `ui-kit` package dependencies are installed and the package is resolvable by workspace-aware tooling

### Requirement: Radix Themes aligned stack

The `ui-kit` package SHALL use Radix UI and `@radix-ui/themes` (or successor packages explicitly aligned with the Radix Themes design system) as the foundation for themed components, consistent with the project README reference to Radix Themes.

#### Scenario: Theme provider available for stories

- **WHEN** Storybook renders stories for ui-kit components that depend on Radix Themes
- **THEN** the story environment SHALL wrap content with the appropriate Radix Themes provider so components render as intended

### Requirement: Storybook development with HMR

The `ui-kit` package SHALL provide a Storybook setup for developing components with hot module replacement (or equivalent fast refresh) such that changes to component source files update in the browser without a full manual restart under normal development.

#### Scenario: Storybook dev script

- **WHEN** a developer runs the documented Storybook development command from `ui-kit`
- **THEN** Storybook starts and serves development builds with HMR or fast refresh enabled

### Requirement: Production build artifact

The `ui-kit` package SHALL expose a build script that produces output suitable for consumption by the client bundler (including JavaScript modules and TypeScript declarations; CSS handling SHALL match whatever Radix Themes and the chosen bundler require for correct styling in the app).

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

- **WHEN** a reader consults the ui-kit documentation shipped with this change
- **THEN** the documentation SHALL state that registry publish, multi-app usage, and SSR are planned extensions rather than guaranteed first-scope deliverables
