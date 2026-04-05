## Why

`TaggedInput` is used for repeatable tokens (locations, tags) but only supports free typing and commit-on-Enter. Features such as tagging people by lookup need **async suggestions** and a **dropdown** so users pick valid entries without guessing. Extending the same component keeps one interaction model (chips + input) and avoids duplicating layout and keyboard behavior in each feature.

## What Changes

- Add an **optional autocomplete** mode to `TaggedInput` in `@shevdi-home/ui-kit`: while the draft input matches, show a **dropdown list** of suggestions supplied asynchronously by the parent (generic shape: stable **value** string for the chip + **label** for display).
- Support **keyboard navigation** (open/close list, move highlight, pick with Enter) and **mouse** selection; align with existing Enter/comma commit behavior when the list is closed or no suggestion is highlighted.
- Document behavior in **Storybook** (mock async suggestions; no app-specific APIs).
- Extend **`RhfTaggedInput`** to pass through new optional props so react-hook-form call sites do not fork the component.
- **No breaking changes** to existing `TaggedInput` call sites: autocomplete is opt-in via new props; default behavior remains unchanged.

## Capabilities

### New Capabilities

- `ui-kit-tagged-input-autocomplete`: Optional async suggestion dropdown for `TaggedInput`, presentational and domain-agnostic (no user API or router in ui-kit).

### Modified Capabilities

- (none) — existing ui-kit package and Storybook coverage requirements already apply once new props or stories are added; no separate delta to baseline specs.

## Impact

- **Packages**: `ui-kit` (component, CSS, exports), possibly a small Radix or headless primitive dependency if chosen in design.
- **Client**: `client/src/shared/ui/RhfTaggedInput.tsx` re-exports / prop forwarding only until a feature wires `getSuggestions` (e.g. photo user tagging in a follow-up change).
- **Server**: Out of scope for this change (user search endpoints remain a separate proposal).
