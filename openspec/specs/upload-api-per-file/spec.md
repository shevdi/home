# upload-api-per-file Specification

## Purpose
TBD - created by archiving change bulk-edit-upload. Update Purpose after archive.
## Requirements
### Requirement: Upload endpoint accepts per-file options
The `POST /photos/upload` endpoint SHALL accept an optional `perFileOptions` field in the multipart form data. This field SHALL be a JSON-encoded array of objects, each containing optional `title` (string), `priority` (number), `tags` (string[]), `country` (string[]), `city` (string[]). The array SHALL be indexed by file position (same convention as the existing `meta` field).

#### Scenario: Upload with per-file options
- **WHEN** client sends `perFileOptions: JSON.stringify([{title:"sunset", tags:["travel"]}, {title:"food", tags:["food"]}])` with 2 files
- **THEN** the first file is saved with title "sunset" and tags ["travel"], the second with title "food" and tags ["food"]

#### Scenario: Upload without per-file options (backward compatibility)
- **WHEN** client sends upload request without `perFileOptions` field, with global `title: "batch"` and `tags: "travel"`
- **THEN** all files are saved with title "batch" and tags ["travel"] (existing behavior preserved)

#### Scenario: Per-file options override global fields
- **WHEN** client sends both `perFileOptions` and global `title` field
- **THEN** the handler uses `perFileOptions[fileIndex]` values, ignoring global `title`/`tags`/`country`/`city`/`priority`

#### Scenario: Per-file options array shorter than files
- **WHEN** `perFileOptions` has 2 entries but 3 files are uploaded
- **THEN** the third file falls back to global fields (title, tags, country, city, priority from body)

### Requirement: Client sends per-file options in upload
The upload service (`uploadPhotos.ts`) SHALL serialize per-file options as a JSON string in the `perFileOptions` formData field. The `isPrivate` and `accessedBy` fields SHALL remain global formData fields.

#### Scenario: FormData contains perFileOptions
- **WHEN** upload is triggered with 3 files each having distinct metadata
- **THEN** the formData includes `perFileOptions` as a JSON string array with 3 entries, and `private` and `accessedBy` as separate global fields

