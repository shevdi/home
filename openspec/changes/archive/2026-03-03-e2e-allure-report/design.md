## Context

The project has a Playwright-based E2E test suite under `e2e/` with two test projects (`main` and `cache`). Tests capture screenshots and videos on every run. Results currently appear only in the Playwright terminal output and in the `test-results/` directory. There is no structured HTML report, making it hard to review failures quickly or share results.

Allure is a widely-used test reporting framework. The `allure-playwright` package integrates with Playwright's reporter API and writes XML result files that the Allure CLI converts into a standalone HTML report.

## Goals / Non-Goals

**Goals:**
- Wire `allure-playwright` into `playwright.config.ts` as an additional reporter
- Output Allure result files to `e2e/allure-results/`
- Add an npm script to generate (`allure generate`) and open (`allure open`) the HTML report
- Keep the existing `list` reporter active for readable terminal output during runs
- Attach existing screenshots and videos to Allure automatically (handled by `allure-playwright` out of the box)
- Git-ignore generated output directories

**Non-Goals:**
- Setting up a CI pipeline or uploading reports to a remote server
- Replacing the existing Playwright `test-results/` artifacts
- Adding Allure step annotations inside test files
- Configuring Allure history or trend data persistence

## Decisions

### Decision: Use `allure-playwright` as an additional reporter (not a replacement)

Playwright supports multiple reporters simultaneously via an array in `playwright.config.ts`. Adding `allure-playwright` alongside the `list` reporter preserves readable terminal output while also producing structured XML results. Replacing the default reporter would degrade the developer experience during local runs.

**Alternative considered**: Using the Playwright HTML reporter (`@playwright/test` built-in). Rejected because it does not produce shareable static artifacts and lacks the richer category/history features Allure provides.

### Decision: Output results to `e2e/allure-results/` (not project root)

Keeping generated artifacts inside the `e2e/` directory co-locates them with the test configuration and avoids cluttering the monorepo root.

### Decision: Separate `generate` and `open` steps in npm scripts

`allure generate` produces the static HTML report; `allure open` serves it locally. Splitting them allows CI pipelines to run only `generate` (to produce a report artifact) without launching a local server.

## Risks / Trade-offs

- **Allure CLI must be available**: `allure generate` / `allure open` require the Allure CLI installed globally or via `allure-commandline`. If not installed, report generation silently fails. → Mitigation: document the requirement in the `e2e/README.md` and optionally add `allure-commandline` as a dev dependency so it is installed via `npm install`.
- **`allure-results/` can grow large**: Each run appends result XML files. If not cleaned between runs, old results mix into the next report. → Mitigation: add `--clean` flag to the `allure generate` script, and document the directory cleanup step.
- **No history without a persistent results store**: Allure history/trend requires copying the previous report's `history/` folder before generating. This is deferred to a future CI integration change.
