## ADDED Requirements

### Requirement: Allure step timeline is human-readable without reading source code
The Allure report SHALL present each test as a hierarchy of named steps that describe system behaviour in plain language. A reader who has never seen the test source SHALL be able to understand what the test verifies by reading the step timeline alone.

#### Scenario: Step labels describe intent, not Playwright API
- **WHEN** a test run completes and the Allure HTML report is generated
- **THEN** no step in the timeline is labelled with a raw Playwright matcher name such as "Expect toBe", "Expect toBeVisible", or "Expect toHaveURL" at the top level — all such assertions are nested inside a descriptive parent step

#### Scenario: Helper calls are identifiable in the timeline
- **WHEN** a test calls a shared helper (e.g. `loginAsAdmin`, `seedPhotos`)
- **THEN** the Allure report shows a named step for that helper (e.g. "Login as admin", "Seed photos") rather than an anonymous group of sub-actions
