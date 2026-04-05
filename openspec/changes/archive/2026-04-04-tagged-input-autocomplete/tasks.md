## 1. Types and API

- [x] 1.1 Define `TaggedSuggestion` (or equivalent) type: `value: string`, `label: React.ReactNode`, export from ui-kit if public
- [x] 1.2 Extend `TaggedInputProps` with optional `fetchSuggestions`, debounce/loading flags as per design, and props to control autocomplete enablement

## 2. TaggedInput implementation

- [x] 2.1 Implement suggestion state (open/closed, highlighted index, in-flight request handling / stale guard)
- [x] 2.2 Render dropdown panel with correct roles and styles (CSS module), positioned below input without breaking existing layout
- [x] 2.3 Wire keyboard: ArrowDown/ArrowUp, Enter (pick vs commit draft), Escape; preserve Backspace-last-tag when draft empty
- [x] 2.4 On pick, call existing tag commit path with `value`; close list and clear draft
- [x] 2.5 Ensure default `TaggedInput` behavior unchanged when autocomplete props are absent

## 3. RhfTaggedInput and exports

- [x] 3.1 Update `RhfTaggedInput` to forward new props and adjust `Omit` / types
- [x] 3.2 Export any new types from `ui-kit/src/index.ts` and client `shared/ui` as needed

## 4. Storybook and quality

- [x] 4.1 Add Storybook story with mock `fetchSuggestions` (artificial delay) and multi-line labels
- [x] 4.2 Run ui-kit build and fix any lint/type issues introduced

## 5. Verification

- [x] 5.1 Manually verify keyboard and mouse flows in Storybook
- [x] 5.2 Confirm no new static imports of app or router code in ui-kit bundle (spot-check)
