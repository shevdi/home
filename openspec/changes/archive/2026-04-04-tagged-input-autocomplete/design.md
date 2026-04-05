## Context

`TaggedInput` (`ui-kit/src/components/TaggedInput/TaggedInput.tsx`) composes `Input`, `TagChips`, and token helpers (`addCommittedToken`, `splitPaste`). It is fully controlled: `tags`, `inputValue`, and change handlers. There is no listbox or popover today. A prior exploration aligned photo **user tagging** with this control but requires **server-backed** suggestions; the ui-kit layer must stay **generic**.

## Goals / Non-Goals

**Goals:**

- Opt-in autocomplete: parent supplies suggestions (typically from a debounced `fetch` the parent implements).
- Dropdown shows each option with a **label** (React node or string); committing a choice adds **`value`** to `tags` (stable id or canonical string), with optional **`renderTag`** already on `TaggedInput` for chip display.
- Accessible list interaction: visible list, keyboard support, sensible focus when opening/closing.
- No imports of app routes, user models, or photo APIs inside ui-kit.

**Non-Goals:**

- User search HTTP routes, Mongo schemas, admin checks, or photo payloads.
- Guaranteeing uniqueness of tokens (still the parent’s responsibility).
- Replacing `TagChips` with a different chip system.

## Decisions

1. **API shape** — Expose something like:
   - `fetchSuggestions?: (query: string) => Promise<Array<{ value: string; label: React.ReactNode }>>` **or** controlled `suggestions` + `onQueryChange` with parent-owned debounce.
   - **Recommendation:** `fetchSuggestions` with optional **debounce delay** inside the component (configurable, default e.g. 200–300 ms) keeps call sites thin; alternatively document that the **callback** may debounce internally—pick one pattern in implementation and Storybook both styles if needed.

2. **Dropdown implementation** — Prefer **headless** primitives consistent with ui-kit rules (`ui-kit-package` spec: Radix without Themes where possible). Options:
   - `@radix-ui/react-popper`-based positioning with a simple `role="listbox"` / `option` pattern, or
   - **Radix Combobox** if version aligns with repo constraints.
   - **Fallback:** absolutely positioned panel under the input using existing CSS module patterns if dependency risk is high—document trade-off (z-index, overflow clipping in modals).

3. **Interaction with commit keys** — When the suggestion panel is **open** and an item is **highlighted**, **Enter** selects that item and adds its `value` to tags (and clears input + closes list). When the panel is closed or nothing is highlighted, **Enter** keeps current behavior (`commitDraft`). **Comma** may commit the draft text as today, or select highlighted—**Decision:** match common combobox UX: comma commits draft only if list closed; if open, optional no-op or same as Enter—spec will require **Enter** for pick.

4. **Duplicate values** — Reuse existing `addCommittedToken` / duplicate suppression so the same `value` is not added twice.

5. **RhfTaggedInput** — Forward new props with `Omit<>` extended so TypeScript at call sites stays accurate.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Popover clipped inside `overflow: hidden` containers | Document `position: portal` if using Radix Popover; Storybook story in scrollable container to verify. |
| Async races (slow response overwrites newer) | Ignore stale responses by query id / abort controller in `fetchSuggestions` wrapper (implementation detail; may live in parent or thin hook). |
| a11y gaps | Use listbox/combobox roles; ensure screen reader labels for the input when autocomplete is on. |

## Migration Plan

- Ship as additive props; existing consumers require **no** code changes.
- After release, feature work can pass `fetchSuggestions` from the client.

## Open Questions

- Exact debounce default and whether to ship **built-in** debounce vs. document-only.
- Whether to expose **max height** + **virtualization** for large lists (likely out of scope v1).
