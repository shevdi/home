## Why

Allure reports for the e2e suite currently show raw Playwright matcher names ("Expect toBe", "Expect toBeVisible") as step labels. These labels reveal nothing about *what* is being verified or *why*, making the report useless as documentation and harder to diagnose on failure. The fix is to introduce named steps using `test.step()` so that every report reads as a clear narrative of system behaviour.

## What Changes

- Wrap all helper functions (`loginAsAdmin`, `seedPhotos`, `resetPhotos`, `resetMock`, `getPhotosFromApi`) in `test.step()` so every test calling them gets a free named step
- Add `test.step()` groups inside each test in `auth.spec.ts`, `photos.spec.ts`, and `photos-cache.spec.ts` to give logical phases with mixed imperative/declarative names (imperative for actions, declarative for assertions)
- Adopt a consistent step naming convention: imperative for user/system actions ("Open photo gallery"), declarative for outcome assertions ("Gallery shows exactly 2 photos")

## Capabilities

### New Capabilities

- `e2e-step-naming`: Convention and implementation for named `test.step()` groups across all e2e specs and helper functions

### Modified Capabilities

- `e2e-allure-reporter`: Allure output now includes human-readable step hierarchy (existing requirement for informative reports is extended)
- `e2e-photo-tests`: Photo spec tests are updated to use named steps
- `e2e-test-suite`: All test helpers are updated to expose named steps

## Impact

- `e2e/tests/helpers/auth.ts` — wrap `loginAsAdmin` in `test.step()`
- `e2e/tests/helpers/api.ts` — wrap `seedPhotos`, `resetPhotos`, `resetMock`, `getPhotosFromApi` in `test.step()`
- `e2e/tests/auth.spec.ts` — add step groups
- `e2e/tests/photos.spec.ts` — add step groups
- `e2e/tests/photos-cache.spec.ts` — convert inline comments to `test.step()` calls
- No new dependencies, no config changes, no breaking changes
