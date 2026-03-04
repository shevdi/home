# Shared Types Package

## ADDED Requirements

### Requirement: Shared types package exists as workspace package

The project SHALL provide a shared types package at `shared/` that is consumable by client, server, mock-server, and e2e via npm workspace dependency.

#### Scenario: Package is installable

- **WHEN** root runs `npm install`
- **THEN** `@shevdi-home/shared` is available to workspace packages

#### Scenario: Types are importable

- **WHEN** any package imports `import { ILink } from '@shevdi-home/shared'`
- **THEN** TypeScript resolves the types without error

### Requirement: No copy step for types

The project SHALL NOT use a copy step to distribute shared types. Types SHALL be consumed directly from the shared package.

#### Scenario: Copy script removed

- **WHEN** build or dev runs
- **THEN** no `copy:types` or equivalent script is executed

#### Scenario: Single source of truth

- **WHEN** a type is updated in `shared/types`
- **THEN** all consuming packages see the update without manual sync

### Requirement: Shared types include core domain types

The shared package SHALL export at least: `ILink`, `ILocation`, `IMeta`, `IPhotos`, `IPhotoSearch`, `IPhotoSearchParams` (or equivalent), and page-related types.

#### Scenario: Typo fix

- **WHEN** shared types are used
- **THEN** `IPhotos` uses `description` (not `descriptopn`)
