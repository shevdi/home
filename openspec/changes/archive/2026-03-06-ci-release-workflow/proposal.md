# CI and Release Workflow

## Why

There is no automated quality gate before code reaches main, and no structured way to track releases with test evidence. Adding GitHub Actions CI ensures lint, unit tests, and E2E tests pass before merge. A release workflow on version tags produces release notes, Allure reports (with screenshots and videos), and commits them to the repo for GitHub Pages, giving a clear history of what shipped and how tests passed.

## What Changes

- **CI workflow**: GitHub Actions runs on push/PR to main; lint (all workspaces), unit tests (client, server), and E2E tests (Playwright via docker-compose.e2e) must pass before merge.
- **Release workflow**: Triggered on version tag push (`v*`). Runs same checks, then generates Allure report, creates release notes, updates CHANGELOG, and commits `docs/` back to the repo.
- **Docs structure**: `docs/CHANGELOG.md` (cumulative), `docs/releases/vX.X.X/release-notes.md`, `docs/releases/vX.X.X/allure-report/` (browsable HTML report with videos).
- **README**: Add release notes link pointing to `docs/CHANGELOG.md` and `docs/releases/`.
- **Root script**: Add `test` script to run unit tests across workspaces.

## Capabilities

### New Capabilities

- `ci-workflow`: GitHub Actions CI that runs lint, unit tests, and E2E tests on push/PR; required for merge to main.
- `release-workflow`: GitHub Actions release pipeline on tag push; generates Allure report, release notes, updates CHANGELOG, and commits `docs/` back to the repo.
- `release-docs-structure`: Structure for `docs/` (CHANGELOG, releases per version, Allure report browsable on GitHub Pages).

### Modified Capabilities

- None.

## Impact

- **New**: `.github/workflows/` (CI and release workflows).
- **New**: `docs/` directory with CHANGELOG and releases structure.
- **Modified**: `package.json` (add root `test` script).
- **Modified**: `README.md` (add release notes section).
- **Config**: GitHub Pages (source: `/docs` or `main` branch).
- **Dependencies**: `docker-compose.e2e.yml` already exists; E2E uses Allure with videos on all tests.
