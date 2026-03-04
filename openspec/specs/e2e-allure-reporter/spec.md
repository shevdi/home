### Requirement: Allure results are produced on every test run
The system SHALL emit Allure-compatible XML result files into `e2e/allure-results/` whenever `playwright test` is executed, covering all test projects (`main` and `cache`).

#### Scenario: Results directory is populated after a test run
- **WHEN** the developer runs `npm test` inside `e2e/`
- **THEN** an `allure-results/` directory is created (or updated) containing at least one XML result file per test

### Requirement: Terminal output is preserved during test runs
The system SHALL continue to display real-time test progress in the terminal (via the `list` reporter) in addition to writing Allure result files.

#### Scenario: Terminal shows test progress while Allure results are written
- **WHEN** `playwright test` is running
- **THEN** each test result is printed to stdout AND an XML result file is written to `allure-results/`

### Requirement: HTML report can be generated from result files
The system SHALL provide an npm script (`test:report`) that converts the XML result files in `allure-results/` into a static HTML report in `allure-report/` with the `--clean` flag so stale data is removed.

#### Scenario: Generating the HTML report
- **WHEN** the developer runs `npm run test:report` inside `e2e/`
- **THEN** an `allure-report/` directory is created containing a valid standalone HTML report

### Requirement: Generated output directories are excluded from version control
The system SHALL ensure that `allure-results/` and `allure-report/` are listed in the repository `.gitignore` so they are never committed.

#### Scenario: Generated directories are git-ignored
- **WHEN** a developer runs `git status` after a test run and report generation
- **THEN** neither `e2e/allure-results/` nor `e2e/allure-report/` appear as untracked files

### Requirement: Screenshots and videos are attached to Allure reports
The system SHALL attach Playwright-captured screenshots and videos to their corresponding Allure test entries automatically without requiring changes to individual test files.

#### Scenario: Screenshot attachment visible in report
- **WHEN** a test run captures a screenshot (as configured by `screenshot: 'on'`)
- **THEN** the generated Allure report includes the screenshot as an attachment on the corresponding test case

### Requirement: Allure step timeline is human-readable without reading source code
The Allure report SHALL present each test as a hierarchy of named steps that describe system behaviour in plain language. A reader who has never seen the test source SHALL be able to understand what the test verifies by reading the step timeline alone.

#### Scenario: Step labels describe intent, not Playwright API
- **WHEN** a test run completes and the Allure HTML report is generated
- **THEN** no step in the timeline is labelled with a raw Playwright matcher name such as "Expect toBe", "Expect toBeVisible", or "Expect toHaveURL" at the top level — all such assertions are nested inside a descriptive parent step

#### Scenario: Helper calls are identifiable in the timeline
- **WHEN** a test calls a shared helper (e.g. `loginAsAdmin`, `seedPhotos`)
- **THEN** the Allure report shows a named step for that helper (e.g. "Login as admin", "Seed photos") rather than an anonymous group of sub-actions
