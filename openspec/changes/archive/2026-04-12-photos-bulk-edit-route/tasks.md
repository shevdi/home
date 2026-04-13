## 1. Routing and pages

- [x] 1.1 Register **`/photos/edit`** under **`photos`** before **`path=":id"`**; wire **`EditPhotosPage`** (or equivalent) with admin gate consistent with upload.
- [x] 1.2 Fix **`pages/Photos/EditPhotos.tsx`**: correct component name/export, title, imports; render the feature **`EditPhotos`** (or rename consistently); remove mistaken gallery-only duplication unless product wants filter/search on this page (default: page title + feature only per design).

## 2. Shared bulk state

- [x] 2.1 Extract **`useBulkPerFileOptions`** (or equivalent) from **`UploadPhoto`**: options map, selection, **`computeMergedView`**, **`handleBulkUpdate`**, tag add/remove, select-all, **`getTargetIds`** usage.
- [x] 2.2 Refactor **`UploadPhoto`** to use the hook; verify upload behavior and tests still pass.

## 3. Gallery handoff

- [x] 3.1 Add admin-only control on the gallery page that **`navigate('/photos/edit', { state: … })`** with the current flat list of photos from the gallery selector (post private-filter), using a typed **`location.state`** contract.
- [x] 3.2 Document the state shape in code (type + brief comment).

## 4. Bulk edit feature UI and save

- [x] 4.1 Implement **`EditPhotos`** feature: read **`useLocation().state`**, hydrate **`PerFileOptions`** per photo id, list rows (dedicated row component or minimal **`FileData`** extension), reuse **`BulkEditForm`** via the hook.
- [x] 4.2 Implement submit: **`changePhoto`** per photo with payload aligned with **`EditPhoto`**; handle loading and per-row errors; disable UI appropriately during save.
- [x] 4.3 Empty state when state missing or empty: message + link to **`/photos`**.

## 5. Tests

- [x] 5.1 Add or extend tests for route registration (if covered) and **`EditPhotos`** empty state + handoff rendering.
- [x] 5.2 Update **`UploadPhoto`** tests if hook extraction changes behavior surface.
