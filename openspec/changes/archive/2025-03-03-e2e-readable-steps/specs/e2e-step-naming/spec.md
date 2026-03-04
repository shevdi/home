## ADDED Requirements

### Requirement: Test helpers expose named steps
Each shared helper function (`loginAsAdmin`, `seedPhotos`, `resetPhotos`, `resetMock`, `getPhotosFromApi`) SHALL wrap its body in a `test.step()` call with a human-readable label so that any test invoking the helper gets a named step in the Allure report automatically.

#### Scenario: loginAsAdmin appears as a named step
- **WHEN** a test calls `loginAsAdmin(page)`
- **THEN** the Allure report shows a step labelled "Login as admin" containing the fill and click sub-actions

#### Scenario: Data helpers appear as named steps
- **WHEN** a test calls `seedPhotos`, `resetPhotos`, `resetMock`, or `getPhotosFromApi`
- **THEN** each call appears in the Allure report as a named step describing the action (e.g. "Seed photos", "Reset photos DB", "Get photos from API")

### Requirement: Test bodies are divided into named logical phases
Each `test()` body in `auth.spec.ts`, `photos.spec.ts`, and `photos-cache.spec.ts` SHALL group its actions and assertions into `test.step()` calls. Each test SHALL have between 2 and 6 top-level steps.

#### Scenario: Simple test has at least 2 steps
- **WHEN** a test performs one action and one assertion (e.g. "views photo gallery")
- **THEN** the Allure report shows at least a navigation step and an assertion step as distinct named entries

#### Scenario: Multi-phase test reflects all phases as steps
- **WHEN** a test performs multiple distinct phases (e.g. the cache lifecycle test with 5 phases)
- **THEN** each phase appears as a separate named step in the Allure timeline

### Requirement: Step names follow a mixed imperative/declarative convention
Step names SHALL use imperative present tense for actions and declarative subject+state phrasing for outcome assertions.

#### Scenario: Action step names
- **WHEN** a step performs a navigation, click, or API call
- **THEN** its name starts with an active verb: "Navigate to …", "Click …", "Edit photo via API", "Open edit page for photo"

#### Scenario: Assertion step names
- **WHEN** a step's primary purpose is to verify an outcome
- **THEN** its name describes the expected state: "Gallery shows exactly 2 photos", "DELETE /api/v1/photos/:id returns 200", "App redirects to /photos"

#### Scenario: Cache phase step names
- **WHEN** a cache-related step combines an action with an expected cache state
- **THEN** its name uses the format "<Action> — <cache state>" e.g. "Reload page — cache HIT (x-served-at unchanged)"
