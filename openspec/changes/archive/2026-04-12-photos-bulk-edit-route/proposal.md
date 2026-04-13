## Why

Admins can bulk-edit metadata when uploading new photos, but there is no equivalent flow for photos already shown in the gallery. Editing many existing items one-by-one is slow. A dedicated bulk-edit page reuses the same mental model (file list, selection, bulk fields) and closes that gap.

## What Changes

- Add an admin-only route **`/photos/edit`** with a dedicated page that lists photos eligible for bulk metadata editing (same field set as upload-time per-file options: title, priority, privacy, location tags, tags, accessed-by).
- From the gallery, add a control (e.g. link or button) that navigates to **`/photos/edit`**, passing the set of photos to edit (photos already loaded for the current gallery query/filter).
- Implement bulk save by applying existing per-photo update semantics (server **PUT** per photo) for each row, with clear per-row or aggregate error handling.
- Refactor or extract shared UI/state so **`UploadPhoto`** and the new bulk-edit flow both use the same bulk-edit panel and list/selection patterns without duplicating large components; the upload page keeps **FileDropzone**; the edit page does not.
- Register the static route **`edit`** under **`photos`** so it is not captured by **`:id`** (route ordering).

## Capabilities

### New Capabilities

- `photos-bulk-edit`: Client behavior for the bulk-edit route, gallery handoff of the photo set, admin gating, list + selection + bulk form + save, and shared composition with upload bulk UI.

### Modified Capabilities

- _(none)_ — Reuses existing photo update API and types; no new server contract in this change.

## Impact

- **Client**: `client/src/app/routes/index.tsx` (new route, order relative to `:id`), `Photos` pages/features (`PhotoGallery`, `Photos` top bar, new `EditPhotos` page/feature), possible new hook or shared component next to `UploadPhoto` / `BulkEditForm` / `perFileOptions`.
- **State / navigation**: Passing the editable photo list (e.g. React Router `location.state` and/or a small Redux slice); refresh behavior should be defined (empty state vs. return to gallery).
- **Tests**: Unit tests for new components/hooks; extend or add navigation tests if the suite covers photo routes.
