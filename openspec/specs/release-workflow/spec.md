# release-workflow Specification

## Purpose
TBD - created by archiving change ci-release-workflow. Update Purpose after archive.
## Requirements
### Requirement: Release workflow runs on version tag push

The system SHALL run the release workflow when a version tag matching `v*` (e.g. v1.0.0) is pushed.

#### Scenario: Tag push triggers release
- **WHEN** a tag matching `v*` is pushed
- **THEN** the release workflow SHALL be triggered

#### Scenario: Non-version tag does not trigger release
- **WHEN** a tag not matching `v*` is pushed
- **THEN** the release workflow SHALL NOT be triggered

### Requirement: Release runs full quality checks

The system SHALL run lint, unit tests, and E2E tests before generating release artifacts.

#### Scenario: Checks must pass before release artifacts
- **WHEN** any of lint, unit tests, or E2E tests fail during release
- **THEN** the workflow SHALL fail and SHALL NOT generate or commit release artifacts

### Requirement: Release generates Allure report

The system SHALL generate an Allure report from E2E results, including screenshots and videos for all tests.

#### Scenario: Allure report generated
- **WHEN** E2E tests complete successfully
- **THEN** the system SHALL run `allure generate` and produce a browsable HTML report with screenshots and videos

### Requirement: Release creates versioned docs structure

The system SHALL create `docs/releases/vX.X.X/` with release-notes.md and allure-report/ for the tagged version.

#### Scenario: Version folder created
- **WHEN** release workflow completes for tag v1.0.0
- **THEN** the system SHALL create `docs/releases/v1.0.0/release-notes.md` and `docs/releases/v1.0.0/allure-report/`

### Requirement: Release updates CHANGELOG

The system SHALL append or update the release entry in `docs/CHANGELOG.md` for the tagged version.

#### Scenario: CHANGELOG updated
- **WHEN** release workflow completes for a version
- **THEN** `docs/CHANGELOG.md` SHALL include an entry for that version

### Requirement: Release commits docs back to repo

The system SHALL commit all changes under `docs/` to the branch the tag points at (typically main).

#### Scenario: Docs committed
- **WHEN** release workflow generates docs
- **THEN** the system SHALL commit and push `docs/` to the repository

