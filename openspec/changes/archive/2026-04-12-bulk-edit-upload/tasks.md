## 1. Shared Schema

- [x] 1.1 Add `perFileOptionsItemSchema` to `shared/schemas/photos.schema.ts` (title, priority, tags, country, city) and export the inferred type `PerFileOptionsItem`
- [x] 1.2 Extend `uploadBodySchema` with `perFileOptions` field (optional JSON string → parsed array of `perFileOptionsItemSchema`)
- [x] 1.3 Export new schema and type from `shared/index.ts`

## 2. Backend Upload Handler

- [x] 2.1 In `server/src/routes/photos.ts` upload handler, read parsed `perFileOptions` array from body
- [x] 2.2 In the file processing loop, resolve per-file title/priority/tags/country/city from `perFileOptions[fileIndex]` with fallback to global body fields
- [x] 2.3 Verify backward compatibility: upload without `perFileOptions` still works with global fields

## 3. Client Per-File State & Selection

- [x] 3.1 Define `PerFileOptions` type and `computeMergedView` pure function (intersection for arrays, same-or-undefined for scalars) in a new utility file `client/src/features/Photos/utils/perFileOptions.ts`
- [x] 3.2 Add `fileOptions: Map<fileId, PerFileOptions>` and `selection: Set<fileId>` state to `UploadPhoto` component
- [x] 3.3 Initialize per-file defaults on file drop (`handleDrop`), remove entries on file removal (`removeFileAt`)

## 4. Selectable File List UI

- [x] 4.1 Create `FileOptionsSummary` component — compact inline display of per-file country/city/tags/title/priority (non-empty only)
- [x] 4.2 Add selection checkbox and click-to-toggle to `FileData` rows (or wrap in a `SelectableFileItem`)
- [x] 4.3 Add "Выбрать все" checkbox above the file list with select-all / deselect-all toggle
- [x] 4.4 Style selected rows with visual highlight (background or border)

## 5. Bulk Edit Form

- [x] 5.1 Create `BulkEditForm` component that receives merged view, selection info, and an `onUpdate` callback
- [x] 5.2 Implement Enter-commit for title and priority inputs (local input state, commit on Enter keypress)
- [x] 5.3 Implement tag add/remove for country, city, tags fields (immediate apply to targets via `onUpdate`)
- [x] 5.4 Keep `private` checkbox and `accessedBy` field as global (not per-file), wired to the existing form state
- [x] 5.5 Show placeholder "(разные значения)" for mixed scalar fields, show selection count label ("Редактирование (N из M выбрано)")

## 6. Upload Service Integration

- [x] 6.1 Update `UploadPhotosThunkArg` to accept `perFileOptions` array instead of single options object
- [x] 6.2 Update `buildUploadFormData` in `uploadPhotos.ts` to serialize `perFileOptions` as JSON string in formData, keep `private` and `accessedBy` as global fields
- [x] 6.3 Update `onSubmit` in `UploadPhoto` to build `perFileOptions` array from the `fileOptions` Map in file order

## 7. Testing

- [x] 7.1 Unit tests for `computeMergedView` — same values, different values, intersection, empty selection
- [x] 7.2 Verify existing E2E upload tests pass (backward compatibility)
