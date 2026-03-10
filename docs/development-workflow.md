# Development Workflow

This document describes the branching model and release process used in this project.

## Overview

- **main** — production-ready code; receives merged releases
- **release/X.Y.Z** — release branches for preparing a version (e.g. `release/1.1.1`)

## Release Process

### 1. Create a release branch

Create a branch named `release/X.Y.Z` matching the version you plan to release:

```bash
git checkout main
git pull origin main
git checkout -b release/1.1.1
```

### 2. Make changes and push

Commit your changes and push to the release branch:

```bash
git add .
git commit -m "feat: your changes"
git push origin release/1.1.1
```

**CI** runs automatically on every push and pull request to `main` and `release/*` branches. It runs:

- Lint
- Unit tests (client, server)
- E2E tests (Docker stack + Playwright)

### 3. Push when ready (tag created automatically)

When the release is ready, push the branch. On the **first push** to `release/X.Y.Z`, the Create Release Tag workflow automatically creates and pushes tag `vX.Y.Z`, which triggers the Release workflow.

```bash
git push origin release/1.1.1
```

If you need to release again from the same branch (e.g. after fixes), push the tag manually:

```bash
git tag v1.1.1
git push origin v1.1.1
```

Optionally run `npm version 1.1.1 --no-git-tag-version` before pushing to keep package.json in sync locally; the Release workflow will set it from the tag regardless.

**Release** workflow runs on tag push. It:

1. Runs lint, unit tests, and E2E tests
2. Generates Allure report and release notes
3. Updates CHANGELOG and package.json version
4. Merges `release/1.1.1` into `main`
5. Commits and pushes docs and version to `main`

### 4. Result

- `main` contains the merged release and release docs
- Release notes and Allure report are in `docs/releases/v1.1.1/`

## Branch Naming Convention

| Tag      | Release branch  |
|----------|-----------------|
| v1.1.1   | release/1.1.1   |
| v1.2.0   | release/1.2.0   |

The tag uses the `v` prefix; the branch name does not.

## GitHub Actions

| Workflow           | Trigger              | Purpose                                              |
|--------------------|----------------------|------------------------------------------------------|
| CI                 | Push/PR to main, release/* | Lint, unit tests, E2E tests                          |
| Create Release Tag | Push to release/*   | Creates tag vX.Y.Z on first push (if tag missing)   |
| Release            | Push tag v*          | Full release: tests, docs, merge to main             |

## See Also

- [Releases](releases/README.md) — release notes and Allure reports
- [CHANGELOG](CHANGELOG.md) — cumulative change history
