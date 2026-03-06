# CI Workflow

## ADDED Requirements

### Requirement: CI runs on push and pull request

The system SHALL run a CI workflow when code is pushed to main or when a pull request targets main.

#### Scenario: Push to main triggers CI
- **WHEN** a push is made to the main branch
- **THEN** the CI workflow SHALL be triggered

#### Scenario: Pull request to main triggers CI
- **WHEN** a pull request is opened or updated targeting main
- **THEN** the CI workflow SHALL be triggered

### Requirement: CI runs lint across all workspaces

The system SHALL run ESLint for all workspaces (client, server, mock-server, e2e) as part of CI.

#### Scenario: Lint passes
- **WHEN** all workspaces pass lint
- **THEN** the workflow SHALL continue to the next step

#### Scenario: Lint fails
- **WHEN** any workspace fails lint
- **THEN** the workflow SHALL fail and report the failure

### Requirement: CI runs unit tests

The system SHALL run unit tests for client and server workspaces as part of CI.

#### Scenario: Unit tests pass
- **WHEN** all unit tests pass
- **THEN** the workflow SHALL continue to the next step

#### Scenario: Unit tests fail
- **WHEN** any unit test fails
- **THEN** the workflow SHALL fail and report the failure

### Requirement: CI runs E2E tests

The system SHALL run E2E tests using Playwright against the docker-compose.e2e stack.

#### Scenario: E2E tests pass
- **WHEN** docker-compose.e2e is up and all E2E tests pass
- **THEN** the workflow SHALL succeed

#### Scenario: E2E tests fail
- **WHEN** any E2E test fails
- **THEN** the workflow SHALL fail and report the failure

### Requirement: CI status is required for merge

The CI workflow status SHALL be configurable as a required check for merging pull requests into main (via branch protection).

#### Scenario: Merge blocked when CI fails
- **WHEN** branch protection requires CI to pass and CI has failed
- **THEN** merge to main SHALL be blocked
