# Design: CI and Release Workflow

## Context

Monorepo with client (React), server (Node/Express), mock-server, e2e (Playwright + Allure), and shared packages. E2E tests run against docker-compose.e2e.yml (MongoDB, backend, frontend, mock-server). Allure reporter is already configured with screenshots and videos on all tests. No CI exists today.

## Goals / Non-Goals

**Goals:**
- Gate merges to main with lint, unit tests, and E2E tests.
- On version tag, produce release notes and Allure report, commit docs to repo, and serve via GitHub Pages.
- Keep Allure reports browsable (no zip archives); include videos for all tests.

**Non-Goals:**
- Auto-versioning or semantic-release.
- Deploying application (only docs/reports to Pages).
- Running E2E on every PR (optional: can run on main only to save time; design supports both).

## Decisions

### 1. Two separate workflows (CI vs Release)

**Decision:** `.github/workflows/ci.yml` for PR/push; `.github/workflows/release.yml` for tag push.

**Rationale:** CI is fast feedback; release is heavier (Allure generation, docs commit). Separating avoids running release steps on every PR. Tag push is the canonical "release" trigger.

**Alternative:** Single workflow with conditional jobs. Rejected: harder to reason about, release steps would need to be clearly gated.

### 2. E2E via docker-compose in Actions

**Decision:** Use `docker compose -f docker-compose.e2e.yml up -d`, wait for health, run `npm run e2e`, then tear down.

**Rationale:** Matches local `e2e:mock` flow. No need for separate service containers; compose brings up full stack.

**Alternative:** Use Actions services (MongoDB, etc.) and build app containers separately. Rejected: more YAML, diverges from local setup.

### 3. Release docs committed back to repo

**Decision:** Release workflow commits `docs/` changes (CHANGELOG, releases/vX.X.X/) to the branch the tag points at (usually main).

**Rationale:** Docs live in repo, versioned with code. GitHub Pages can serve from `/docs` on main.

**Alternative:** Deploy to gh-pages branch only, no commit to main. Rejected: user explicitly requested commit back.

### 4. GitHub Pages source: /docs on main

**Decision:** Configure Pages to serve from `main` branch, `/docs` folder.

**Rationale:** Single branch; docs and code together. No separate gh-pages branch to maintain.

**Alternative:** gh-pages branch. Rejected: adds branch management; /docs is simpler.

### 5. Release notes content

**Decision:** Per-version `release-notes.md` with human-written summary. CHANGELOG.md follows Keep a Changelog format; can be manual or tool-assisted later.

**Rationale:** No conventional-commits tooling yet; manual is sufficient. Can add standard-version later.

**Alternative:** Auto-generate from commits. Deferred: out of scope for initial implementation.

### 6. Allure report path

**Decision:** `docs/releases/vX.X.X/allure-report/` — full generated report (HTML, data, attachments including videos).

**Rationale:** Browsable at `https://<user>.github.io/<repo>/releases/v1.0.0/allure-report/`. No archive; direct HTML.

**Alternative:** Store only link to Actions artifact. Rejected: artifacts expire in 90 days; user wants persistent report on Pages.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Allure reports with videos exceed 1 GB Pages limit | Monitor size; consider `video: 'retain-on-failure'` later if needed |
| Release workflow fails after E2E, leaving partial state | Workflow is atomic per run; re-run or fix and re-tag |
| Commit from Actions triggers recursive workflow | Use `[skip ci]` in commit message or path filters to exclude docs-only pushes |
| E2E flakiness blocks merges | Use retries in Playwright; consider running E2E only on main if needed |

## Migration Plan

1. Add `.github/workflows/ci.yml` and `release.yml`.
2. Add root `test` script to package.json.
3. Create `docs/` with initial CHANGELOG.md and README placeholder.
4. Update README.md with release notes link.
5. Enable GitHub Pages (Settings → Pages → Source: main, /docs).
6. Add branch protection rule: require CI to pass before merge to main.
7. Create first tag (e.g. v1.0.0) to validate release workflow.

## Open Questions

- Whether to run E2E on every PR or only on push to main (time vs coverage trade-off).
