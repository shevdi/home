## Why

The E2E test suite currently produces raw Playwright output with screenshots and videos but no structured, human-readable report. When tests fail in CI or locally it is hard to quickly understand which tests failed, view step-by-step traces, and share results with teammates. Adding Allure reporting gives a rich HTML report with test history, categories, and attachments.

## What Changes

- Install `allure-playwright` reporter alongside the existing Playwright setup
- Configure Playwright to emit Allure results into an `allure-results/` directory
- Add an npm script (`test:report`) to generate and open the HTML report from `allure-results/`
- Keep existing screenshot and video capture; they will be attached to Allure steps automatically
- Support both local dev usage and a potential CI artifact upload path

## Capabilities

### New Capabilities

- `e2e-allure-reporter`: Integration of the Allure reporter into the Playwright config so every test run produces structured XML results and a generated HTML report

### Modified Capabilities

- (none)

## Impact

- `e2e/playwright.config.ts`: add `allure-playwright` to the `reporter` array
- `e2e/package.json`: add `allure-playwright` dev dependency and `test:report` script
- `e2e/allure-results/` and `e2e/allure-report/` directories will be generated at runtime (should be git-ignored)
- No changes to test files, server, client, or docker configuration
