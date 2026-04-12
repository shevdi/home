## Why

The Upload page currently applies a single set of metadata (title, priority, country, city, tags) to all files in a batch. When uploading photos from different locations or contexts, the user must either upload them one-by-one or edit each photo individually after upload. This makes batch uploads with mixed metadata tedious — the common case for real photo sets.

## What Changes

- Each uploaded file gets its own editable metadata (title, priority, country, city, tags) tracked in per-file state.
- Files in the upload list become selectable (click to toggle, select/deselect all).
- A bulk edit form operates on the current selection: merged view shows common values (intersection for tags, matching value or placeholder for scalars). Editing applies to all selected files, or all files if none are selected.
- Simple inputs (title, priority) use explicit Enter-commit: the value is written to target files only when the user presses Enter.
- Each file row shows a compact summary of its current metadata alongside the existing EXIF info.
- Global fields (`private`, `accessedBy`) remain batch-wide — they apply to all files uniformly.
- The backend upload API accepts per-file options via a new `perFileOptions` JSON field, falling back to the existing global fields for backward compatibility.

## Capabilities

### New Capabilities
- `upload-per-file-options`: Per-file metadata state, file selection, bulk edit form with merged view and Enter-commit, compact per-file summary display.
- `upload-api-per-file`: Backend support for per-file options in the upload endpoint, shared schema addition.

### Modified Capabilities
- `shared-zod-schemas`: Add `perFileOptionsItemSchema` and extend `uploadBodySchema` with the `perFileOptions` field.

## Impact

- **Client**: `UploadPhoto.tsx` — significant rework: per-file state management, selection model, new `BulkEditForm` and `SelectableFileList` components. `FileData.tsx` — add selection checkbox and compact options summary. `uploadThunk.ts` / `uploadPhotos.ts` — send per-file options in formData.
- **Shared**: `shared/schemas/photos.schema.ts` — new `perFileOptionsItemSchema`, extended `uploadBodySchema`.
- **Server**: `server/src/routes/photos.ts` — upload handler reads `perFileOptions[fileIndex]` for per-file title/priority/tags/country/city, falls back to global fields.
- **Tests**: Upload E2E tests and any unit tests covering upload flow need updates.
