# Tasks: CI and Release Workflow

## 1. Setup

- [x] 1.1 Add root `test` script to package.json: `"test": "npm run test --workspaces --if-present"`
- [x] 1.2 Create `.github/workflows/` directory

## 2. CI Workflow

- [x] 2.1 Create `.github/workflows/ci.yml` with trigger on push/PR to main
- [x] 2.2 Add job: checkout, setup Node, install deps, cache node_modules
- [x] 2.3 Add step: run lint (`npm run lint`)
- [x] 2.4 Add step: run unit tests (`npm run test`)
- [x] 2.5 Add step: start docker-compose.e2e, wait for services, run E2E (`npm run e2e`), tear down
- [x] 2.6 Verify CI runs successfully on push

## 3. Docs Structure

- [x] 3.1 Create `docs/` directory
- [x] 3.2 Create `docs/CHANGELOG.md` with Keep a Changelog format and initial placeholder
- [x] 3.3 Create `docs/releases/` directory (empty or with README placeholder)

## 4. Release Workflow

- [x] 4.1 Create `.github/workflows/release.yml` with trigger on tag push `v*`
- [x] 4.2 Add job: same setup as CI (checkout, Node, deps, cache)
- [x] 4.3 Add steps: lint, unit tests, docker-compose up, E2E with Allure
- [x] 4.4 Add step: run `allure generate` and output to `docs/releases/v{tag}/allure-report/`
- [x] 4.5 Add step: create `docs/releases/v{tag}/release-notes.md` (template or from tag)
- [x] 4.6 Add step: append version entry to `docs/CHANGELOG.md`
- [x] 4.7 Add step: commit and push `docs/` to repo (use GITHUB_TOKEN, `[skip ci]` in message)
- [x] 4.8 Add path filter or skip logic to avoid release workflow re-triggering on docs-only commits

## 5. README

- [x] 5.1 Add "Releases" section to root README.md with links to docs/CHANGELOG.md and docs/releases/

## 6. Configuration

- [x] 6.1 Document in README or design: enable GitHub Pages (Settings → Pages → Source: main, /docs)
- [x] 6.2 Document: add branch protection rule requiring CI to pass before merge to main
