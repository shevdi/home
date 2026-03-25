# UI Kit Package (delta)

Delta for `openspec/specs/ui-kit-package/spec.md` — merge on archive.

## ADDED Requirements

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
