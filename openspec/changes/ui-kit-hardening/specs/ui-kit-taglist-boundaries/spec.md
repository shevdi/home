# UI Kit Tag List Boundaries

## Purpose

Define how tag/chip UI in `@shevdi-home/ui-kit` stays presentational and free of application routing and domain-specific URL encoding, while still allowing the client to compose navigation and search behavior.

## ADDED Requirements

### Requirement: Presentational tag list without router imports

The `ui-kit` package SHALL provide a tag or chip list component suitable for displaying tags and optional remove actions that does NOT import `react-router`, `react-router-dom`, or equivalent routing libraries as implementation dependencies of the core presentational module.

#### Scenario: Core module builds without router

- **WHEN** the ui-kit production build bundles the presentational tag/chip component
- **THEN** the core presentational module SHALL NOT include a static import from `react-router` or `react-router-dom`

### Requirement: Optional navigation composed outside the kit

Application code MAY attach navigation or filter behavior (e.g. navigating to a search URL) by composition—using wrapper components, render callbacks, or an explicitly documented extension API—without requiring the kit to encode photo-search or page-specific query shapes.

#### Scenario: Client can wrap chips with links

- **WHEN** a feature needs a tag to act as a link to a filtered search
- **THEN** the client SHALL be able to implement that behavior by wrapping or supplying rendering for each tag without the kit importing application-specific URL builders

### Requirement: Domain URL helpers not required in kit

The presentational tag/chip component SHALL NOT depend on `buildSearchParams` or other domain-specific search parameter encoders defined for the photos feature as part of its default implementation.

#### Scenario: Kit does not import photo search param utilities

- **WHEN** a developer inspects the ui-kit source for the presentational tag list
- **THEN** that component SHALL NOT import project-specific search types or helpers that exist solely to support the photos search URL schema
