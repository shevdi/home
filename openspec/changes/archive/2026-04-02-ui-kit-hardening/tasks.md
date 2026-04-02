## 1. Tag list boundaries

- [x] 1.1 Add a presentational tag/chip component in `ui-kit` with no `react-router` or `buildSearchParams` imports (name per design decision, e.g. chips + optional remove).
- [x] 1.2 Add a client- or feature-level wrapper (or composition pattern) that restores NavLink + search URL behavior for photos screens; update `Search`, `EditPhoto`, `UploadPhoto`, and any other `TagList` consumers.
- [x] 1.3 Re-export or deprecate old `TagList` from `ui-kit`/`client` shared ui per migration plan; run ui-kit build and client typecheck.
- [x] 1.4 Add Storybook stories for the presentational tag component (default + removable variant if applicable).

## 2. Storybook coverage

- [x] 2.1 Add `Loader.stories.tsx` with at least default state.
- [x] 2.2 Add `Error.stories.tsx` and `ErrMessage.stories.tsx` with representative content.
- [x] 2.3 Add `UploadLabel.stories.tsx` documenting file-input association pattern.

## 3. Documentation

- [x] 3.1 Add a short **Field + Input vs LabeledInput** note (ui-kit README or `design.md` follow-up in repo) and mention deprecated `TextField` alias.

## 4. Verification

- [x] 4.1 Run `ui-kit` production build; run client `tsc` / tests for affected features; smoke Storybook for new and updated stories.
