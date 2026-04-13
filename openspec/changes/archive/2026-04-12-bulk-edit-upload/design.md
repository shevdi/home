## Context

The Upload page currently uses a single `react-hook-form` instance with one set of `PhotoCommonFields` (title, priority, private, country, city, tags, accessedBy) applied uniformly to every file in a batch. The upload API (`POST /photos/upload`) reads these values once from the request body and uses them for all files processed in its sequential loop. The `meta` field already follows a per-file pattern — a JSON array indexed by file position.

Users frequently upload batches of photos taken in different locations or contexts. Today they must either upload files one-by-one or manually edit each photo after upload. This change introduces per-file metadata editing with a bulk-selection workflow directly on the Upload page.

## Goals / Non-Goals

**Goals:**
- Per-file state for content fields (title, priority, country, city, tags) managed in component state.
- Click-to-select files with select-all toggle; bulk edit form operates on the selection.
- Merged view: intersection for tag arrays, same-or-placeholder for scalar fields.
- Explicit Enter-commit for simple inputs (title, priority); tag inputs follow existing Enter-to-add behavior.
- Backend accepts per-file options without breaking existing API consumers.

**Non-Goals:**
- Per-file `private` or `accessedBy` — these remain batch-wide (access control should be uniform per upload).
- Drag-to-reorder files.
- Bulk edit on the existing Edit photo page (planned as follow-up, not in this change).
- Keyboard shortcuts for selection (Shift+click range, Ctrl+click) — click-toggle and select-all are sufficient for v1.

## Decisions

### 1. Per-file state as `Map<fileId, PerFileOptions>` in component state

**Choice**: Local `useState<Map<string, PerFileOptions>>` in `UploadPhoto`, not in Redux or react-hook-form.

**Why over react-hook-form field arrays**: react-hook-form field arrays add complexity for dynamic N-form scenarios where we also need a merged view across multiple entries. A plain Map is simpler to read, merge, and update. The bulk edit form is a separate controlled component that computes merged values on render and writes back on commit.

**Why over Redux**: This state is ephemeral — it exists only during the upload page session and is discarded on navigation. No need for persistence or cross-component access beyond the Upload page tree.

### 2. Selection model: Set<fileId> with toggle + select-all

**Choice**: `useState<Set<string>>` for selection. Click on a file row toggles its membership. A "select all" checkbox at the top of the file list toggles between all-selected and none-selected.

**Alternatives considered**: Shift+click for range selection — deferred to a later iteration. The select-all toggle covers the most common case (edit all files at once).

### 3. Merged view: intersection for tags, same-or-undefined for scalars

**Choice**: When computing the form values to display:
- **Scalar fields** (title, priority): if all target files share the same value, show it; otherwise show `undefined` → rendered as placeholder text "(разные значения)".
- **Tag fields** (country, city, tags): show the intersection (values present in every target file). Adding a tag adds it to all targets; removing a tag removes it from all targets.

**Why intersection over union**: Union with partial indicators is complex UI for limited value. Intersection gives a clear, actionable answer: "these are the tags all selected files have in common."

### 4. Enter-commit for simple inputs

**Choice**: Title and priority inputs do NOT live-update per-file state on every keystroke. The user types freely and presses Enter to commit the value to all target files. This prevents partial text from spreading across files mid-typing.

**Implementation**: The bulk edit form tracks its own local input values (controlled inputs). On Enter keypress or blur (optional), it writes the committed value into the `fileOptions` Map for all target file IDs.

### 5. Backend: `perFileOptions` JSON array field in formData

**Choice**: Add a new `perFileOptions` string field to the upload formData, containing a JSON array of `{ title?, priority?, tags?, country?, city? }` objects indexed by file position — same pattern as the existing `meta` field.

**Why not change existing fields**: Backward compatibility. If `perFileOptions` is absent, the handler falls back to the existing global `title`, `tags`, etc. fields. Old clients continue to work unchanged.

**Schema**: New `perFileOptionsItemSchema` in `shared/schemas/photos.schema.ts`, added to `uploadBodySchema`.

### 6. Component structure

```
UploadPhoto (state owner: fileOptions Map, selection Set)
├── FileDropzone (unchanged)
├── SelectableFileList (NEW)
│   ├── SelectAllCheckbox
│   └── SelectableFileItem[] (click to toggle, wraps existing FileData)
│       ├── Checkbox (visual selection indicator)
│       ├── FileData (existing — thumbnail, name, EXIF meta, status)
│       └── FileOptionsSummary (NEW — compact per-file metadata summary)
├── BulkEditForm (NEW — replaces PhotoCommonFields for per-file fields)
│   ├── private checkbox (global)
│   ├── title input (Enter-commit)
│   ├── priority input (Enter-commit)
│   ├── country RhfTaggedInput (immediate apply)
│   ├── city RhfTaggedInput (immediate apply)
│   ├── tags RhfTaggedInput (immediate apply)
│   └── accessedBy RhfTaggedInput (global)
└── Upload button
```

`PhotoCommonFields` remains unchanged for the Edit page. The Upload page replaces it with `BulkEditForm` which consumes the merged view and emits field-level updates.

### 7. Upload thunk change

`uploadPhotosThunk` currently sends a single `options` object. It will instead send a `perFileOptions` array built from the `fileOptions` Map. The `isPrivate` and `accessedBy` fields remain global. The service layer (`uploadPhotos.ts`) serializes `perFileOptions` as a JSON string in the formData, alongside the existing `meta` field.

## Risks / Trade-offs

- **[Complexity]** Per-file state adds complexity to the upload page. → Mitigated by keeping state in a simple Map and isolating the merge logic into a pure function (`computeMergedView`). Unit-testable without component rendering.
- **[UX: Enter-commit discoverability]** Users may not realize they need to press Enter to apply values. → Mitigated by showing a subtle hint "(Enter для применения)" next to input fields, and by the immediate visual feedback in the file list compact summary when values are committed.
- **[Backend backward compatibility]** Old clients that don't send `perFileOptions` must still work. → Ensured by fallback: if `perFileOptions` is empty/absent, the handler uses global `body.title`, `body.tags`, etc. as today.
- **[Large batches]** With 50 files and per-file state, the merged view recomputation could be noticeable. → In practice, intersection/comparison of 50 small objects is sub-millisecond. Use `useMemo` with `[fileOptions, selection]` deps.
