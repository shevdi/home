## Context

`@shevdi-home/ui-kit` ships shared React components for the SPA. Recent work split **Input** (primitive) and **LabeledInput** (labeled composite) and introduced **Field** + Radix **Label** for accessible forms. **TagList** still lives in the kit but imports **`react-router`** (`NavLink`) and **`buildSearchParams`** with a photos/search-shaped type—so the “kit” depends on app navigation and domain query encoding. Several exports (**Loader**, **Error**, **ErrMessage**, **UploadLabel**) have no Storybook stories, unlike Button, Field, Input, etc.

## Goals / Non-Goals

**Goals:**

- Make **tag/chip UI** in the kit **presentational** by default: no direct `react-router` or photo-search URL builder imports inside the reusable component file(s).
- Add **minimal Storybook coverage** for currently undocumented exported components, aligned with `ui-kit-storybook-coverage` spec.
- Document **when to use Field + Input vs LabeledInput** and how **TextField** deprecation fits (short section in this change’s tasks or a README fragment—no full design-system site).

**Non-Goals:**

- Redesign visual tokens, spacing, or full accessibility audit of every component.
- Introduce a new form library or change RHF usage in the client.
- Publish ui-kit to npm (still workspace-only unless a separate change says otherwise).

## Decisions

**1. Tag list: split vs inject**

- **Chosen direction**: Prefer a **presentational** component (e.g. chips + optional remove button) in `ui-kit` with **no** `NavLink`. Support “clickable tag navigates” either via **`renderTag`** / **`component` prop** / **`asChild`-style** pattern, or a thin **`client` wrapper** (e.g. `PhotoTagList`) that composes the kit component with `NavLink` + `buildSearchParams`.
- **Alternatives considered**: (a) Only inject `LinkComponent` from react-router—still couples API to routing concepts; acceptable if documented. (b) Keep `TagList` as-is and document exception—rejected as primary outcome because it does not reduce coupling.

**2. Where `buildSearchParams` lives**

- **Chosen direction**: Keep **generic** URL helpers in **`shared`** or **client** if they encode app search state; **ui-kit** MUST NOT import domain search types for core tag UI.
- **Rationale**: Single responsibility; kit stays testable without router memory history.

**3. Storybook scope**

- **Chosen direction**: At least **one story file per currently missing export** (Loader, Error, ErrMessage, UploadLabel) plus stories for the **new/refactored** tag UI. Stories stay **lightweight** (default + one edge case where useful, e.g. error with message, loader visible).

**4. Breaking changes**

- **Chosen direction**: Prefer **non-breaking** migration: export old **`TagList`** name as deprecated alias re-exporting the new split, or keep `TagList` as the app wrapper in `client` only—exact choice during implementation; spec allows **BREAKING** only if unavoidable.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Many call sites import `TagList` from `@/shared/ui` | Implement wrapper or compatibility export; update imports in one pass with tests. |
| Duplication between kit chips and client link wrapper | Keep kit dumb; single wrapper module in client for NavLink + search. |
| Spec delta for `ui-kit-package` drifts from archived canonical spec | During archive, merge ADDED requirements into `openspec/specs/ui-kit-package/spec.md` carefully. |

## Migration Plan

1. Introduce presentational API (and/or client wrapper); switch **Search**, **EditPhoto**, **UploadPhoto** (and any other imports) to new import paths.
2. Run **ui-kit build**, **client typecheck**, **Jest** for affected features; **Storybook** smoke for new stories.
3. Remove deprecated path in a later change if dual export was used.

## Open Questions

- Exact public name for the presentational component (`TagChips`, `TagListBase`, etc.)—resolve during implementation for minimal churn.
- Whether **TagList** remains exported from `ui-kit` at all, or only from `client` shared ui—product preference; proposal favors kit owning presentation only.
