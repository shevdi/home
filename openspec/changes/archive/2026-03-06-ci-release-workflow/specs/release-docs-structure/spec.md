# Release Docs Structure

## ADDED Requirements

### Requirement: CHANGELOG exists at docs root

The system SHALL maintain a cumulative changelog at `docs/CHANGELOG.md` in Keep a Changelog format.

#### Scenario: CHANGELOG present
- **WHEN** the docs structure is initialized or a release is made
- **THEN** `docs/CHANGELOG.md` SHALL exist and SHALL list versions with Added/Changed/Fixed sections

### Requirement: Releases are versioned under docs/releases

The system SHALL organize per-version release content under `docs/releases/vX.X.X/`.

#### Scenario: Version folder structure
- **WHEN** a release is created for version v1.0.0
- **THEN** the system SHALL create `docs/releases/v1.0.0/` containing at least `release-notes.md` and `allure-report/`

### Requirement: Release notes are human-readable

Each version SHALL have a `release-notes.md` file with a human-readable summary of changes.

#### Scenario: Release notes file
- **WHEN** release workflow runs for a version
- **THEN** `docs/releases/vX.X.X/release-notes.md` SHALL exist with summary content

### Requirement: Allure report is browsable HTML

The Allure report SHALL be stored as a full HTML report (not an archive) under `docs/releases/vX.X.X/allure-report/`, viewable on GitHub Pages.

#### Scenario: Report is browsable
- **WHEN** GitHub Pages is configured to serve from docs
- **THEN** `docs/releases/vX.X.X/allure-report/` SHALL be accessible as a browsable HTML report including screenshots and videos

### Requirement: README links to release notes

The root `README.md` SHALL include a section linking to the changelog and release notes.

#### Scenario: Release links in README
- **WHEN** a user views the root README
- **THEN** it SHALL contain links to `docs/CHANGELOG.md` and `docs/releases/`
