## ADDED Requirements

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
