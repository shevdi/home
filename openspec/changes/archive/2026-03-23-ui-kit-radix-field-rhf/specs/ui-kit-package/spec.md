# UI Kit Package (delta)

## REMOVED Requirements

### Requirement: Radix Themes aligned stack

**Reason**: Core form controls will use headless `@radix-ui/react-*` primitives with project CSS; requiring Radix Themes as the foundation for all themed components is no longer accurate.

**Migration**: Optional `@radix-ui/themes` Theme provider MAY remain in Storybook preview for stories that still rely on it; new headless-based components SHALL NOT require Theme at runtime in the client.

## ADDED Requirements

### Requirement: Headless Radix UI primitives for interactive controls

The `ui-kit` package SHALL use **headless** Radix UI primitives (e.g. `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-slot` or `@radix-ui/react-primitive` as appropriate) for interactive controls refactored under this capability, styled with the project’s **CSS modules** (or equivalent documented styling). **`@radix-ui/themes`** SHALL NOT be required for these controls to function or render correctly in the client or in Storybook stories that target only these primitives.

#### Scenario: Storybook without Theme for headless stories

- **WHEN** Storybook renders a story for a component built solely from headless Radix primitives and project CSS
- **THEN** the story SHALL NOT require wrapping content in a Radix Themes `Theme` provider for correct behavior or layout of that component

#### Scenario: Optional Themes for legacy or mixed stories

- **WHEN** a story or application screen still depends on Radix Themes for unrelated reasons
- **THEN** wrapping with a Themes provider remains allowed and SHALL NOT conflict with headless form-field components

## MODIFIED Requirements

### Requirement: Production build artifact

The `ui-kit` package SHALL expose a build script that produces output suitable for consumption by the client bundler (including JavaScript modules and TypeScript declarations; CSS handling SHALL match **project CSS modules**, **Radix primitive** dependencies, and the chosen bundler so styles apply correctly in the app).

#### Scenario: Build succeeds cleanly

- **WHEN** a developer runs the ui-kit production build command
- **THEN** the build completes without errors and emits artifacts at the declared output paths
