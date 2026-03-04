## Context

The e2e suite uses Playwright with `allure-playwright` v3. The reporter auto-instruments Playwright page actions (goto, click, fill, etc.) and assigns them readable labels. However, bare `expect()` assertions are recorded as "Expect toBe" / "Expect toBeVisible" with no surrounding context. This makes the Allure step timeline useless as documentation and harder to read during failure triage.

The tests are already logically structured via `test.describe()` and helper functions. The helpers (`loginAsAdmin`, `seedPhotos`, etc.) perform meaningful multi-step actions but contribute anonymous steps to the report. The photos-cache spec even has inline comments that describe the intended step phases — those comments are invisible in Allure.

## Goals / Non-Goals

**Goals:**
- Allure step timeline reads as a narrative of what the system does, not what Playwright's API was called
- Named steps group related actions and assertions under a single intent label
- Helper functions expose their own step labels so callers benefit automatically
- Mixed naming style: imperative for user/system actions, declarative for outcome assertions
- Zero new npm dependencies

**Non-Goals:**
- Full Page Object Model refactor — not warranted for the current test volume
- Adding steps to `beforeAll` / `afterAll` setup/teardown hooks (noise, not signal)
- Renaming test titles — they are already descriptive
- Introducing custom `expect` wrappers or additional abstraction layers

## Decisions

### D1: Use `test.step()` from `@playwright/test`, not `allure.step()` from `allure-js-commons`

Both produce named Allure steps. `test.step()` is already in scope everywhere (same import as `test`), adds no dependency, and works identically in non-Allure reporters (e.g., the `list` reporter still shows step timing). `allure.step()` would require an additional import and couples the test code to the Allure reporter.

*Alternative rejected*: `allure-js-commons` `step()` — adds a dependency, same outcome.

### D2: Wrap helpers at the function level, not at each call site

`loginAsAdmin`, `seedPhotos`, `resetPhotos`, `resetMock`, and `getPhotosFromApi` will each wrap their own body in a `test.step()`. This means every test that calls them gets a named step for free, with no per-test changes required. The step name is the canonical description of what the helper does.

*Alternative rejected*: Wrapping at each call site — repetitive, easy to forget, inconsistent.

### D3: Mixed naming convention — imperative for actions, declarative for assertions

- **Imperative** (present tense, active): for actions the test performs — "Navigate to /photos", "Click delete button", "Edit photo via API"
- **Declarative** (subject + state): for outcome checks — "Gallery shows exactly 2 photos", "DELETE /api/v1/photos/:id returns 200", "App redirects to /photos"

Steps that mix action + expected state (especially in the cache test) use the format: `"<Action> — <expected cache state>"` e.g. `"Reload page — cache HIT (x-served-at unchanged)"`.

### D4: photos-cache.spec.ts — convert comments to `test.step()` bodies

The cache lifecycle test has 5 inline `// Step N:` comments that already describe the logical phases precisely. Each comment becomes a `test.step()` call wrapping the assertions below it. Return values from steps replace the current sequential variable assignments.

## Risks / Trade-offs

- **Verbosity increase** — wrapping in `test.step()` adds indentation and async closures. Mitigated by keeping step granularity coarse (3–6 steps per test, not one per assertion).
- **Step return value plumbing** — steps that need to pass data to later steps must use `return` inside `test.step()` and capture the result. The cache test does this naturally. Mitigated by keeping data flow explicit and local.
- **`test.step()` requires `test` in scope in helpers** — `helpers/auth.ts` and `helpers/api.ts` currently only import from `@playwright/test` the types they need. Adding `test` to the import is required. This is safe; `test` is the standard Playwright fixture runner, not a browser-specific object.
