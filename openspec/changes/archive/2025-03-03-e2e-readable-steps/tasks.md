## 1. Update shared helpers

- [x] 1.1 Add `test` to imports in `e2e/tests/helpers/auth.ts` and wrap `loginAsAdmin` body in `test.step('Login as admin', ...)`
- [x] 1.2 Add `test` to imports in `e2e/tests/helpers/api.ts` and wrap `seedPhotos` in `test.step('Seed photos', ...)`
- [x] 1.3 Wrap `resetPhotos` in `test.step('Reset photos DB', ...)`
- [x] 1.4 Wrap `resetMock` in `test.step('Reset mock server', ...)`
- [x] 1.5 Wrap `getPhotosFromApi` in `test.step('Get photos from API', ...)`

## 2. Add steps to auth.spec.ts

- [x] 2.1 In "shows error on invalid credentials": wrap fill+click in "Submit invalid credentials" step; wrap expect in "Error message is shown" step
- [x] 2.2 In "redirects to home on successful login and logs out": add "Fill credentials and submit" step, "Logged-in state is confirmed" step, "Log out via settings" step, "Logout is confirmed" step

## 3. Add steps to photos.spec.ts

- [x] 3.1 In unauthenticated "views photo gallery": add "Open photo gallery" step and "Public photos visible, private badge absent" step
- [x] 3.2 In unauthenticated "goes to photo by click": add "Open gallery and wait for photos" step, "Click first photo" step, "Single photo page is shown" step
- [x] 3.3 In unauthenticated "fails to open upload photo page": add "Navigate to /photos/new" step and "Not-found message is shown" step
- [x] 3.4 In unauthenticated "fails to open private photo by direct link": add "Get private photo from API" step, "Navigate to private photo URL" step, "Not-found message is shown" step
- [x] 3.5 In authenticated "views photo gallery": add "Open gallery" step, "Enable private filter" step, "Private photos are visible" step
- [x] 3.6 In authenticated "goes to photo by click": add "Open gallery and wait for photos" step, "Click first photo" step, "Edit link is visible on detail page" step
- [x] 3.7 In authenticated "opens private photo": add "Get private photo from API" step, "Navigate to private photo URL" step, "Private photo is accessible" step
- [x] 3.8 In "edits photo": add "Get first photo from API" step, "Navigate to edit page" step, "Fill updated title" step, "Save and verify API returns 200" step
- [x] 3.9 In "deletes photo": add "Get first photo from API" step, "Navigate to edit page" step, "Click delete and wait for API response" step, "DELETE returns 200" step, "App redirects to gallery" step
- [x] 3.10 In "filters by tag": add "Open gallery" step, "Filter by tag вьетнам" step, "Gallery shows exactly 2 photos" step
- [x] 3.11 In "filters by non-existent tag shows empty gallery": add "Open gallery" step, "Filter by non-existent tag" step, "Gallery is empty" step
- [x] 3.12 In "filters by country": add "Open gallery" step, "Filter by country Вьетнам" step, "Gallery shows exactly 2 photos" step
- [x] 3.13 In "full-size link points to correct URL": add "Get public photo with fullSizeUrl from API" step, "Open photo detail page" step, "Full-size link href matches photo.fullSizeUrl" step
- [x] 3.14 In "photo detail shows date and tags": add "Get photo with metadata from API" step, "Open photo detail page" step, "Date link and tags are visible" step
- [x] 3.15 In "photo detail without metadata hides date and tags": add "Get photo without metadata from API" step, "Open photo detail page" step, "Date link and tag list are not shown" step

## 4. Convert photos-cache.spec.ts comments to steps

- [x] 4.1 Replace `// Step 1` comment block with `test.step('Load gallery — cache MISS, urlCache MISS', ...)` returning `response1`
- [x] 4.2 Replace `// Step 2` comment block with `test.step('Reload page — cache HIT (x-served-at unchanged)', ...)` and assert `response2.servedAt === response1.servedAt`
- [x] 4.3 Replace `// Step 3` comment block with `test.step('Edit photo via API to bust response cache', ...)`
- [x] 4.4 Replace `// Step 4` comment block with `test.step('Reload page — cache MISS (cleared by edit), urlCache HIT (versions unchanged)', ...)`
- [x] 4.5 Replace `// Step 5` comment block with `test.step('Change sort order — cache MISS, urlCache HIT (same versions)', ...)`
