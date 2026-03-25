## Why

`@shevdi-home/ui-kit` is growing a mix of **reusable primitives** (Input, Field, Button) and **app-shaped** pieces: `TagList` depends on `react-router` and domain-specific URL helpers (`buildSearchParams`), which tightens coupling, complicates Storybook and tests, and blurs the kit’s boundary. At the same time, several **exported components lack Storybook stories**, so regressions and API discovery are weaker than for the already-documented controls. This change hardens the package by clarifying boundaries and raising documentation (stories + guidance) to the level the rest of the kit implies.

## What Changes

- **Decouple tag UI from routing and search schema**: introduce a **presentational** tag/chip list (or equivalent API) in the kit that does not import `react-router` or photo-search param builders; keep **optional** link behavior via render props or an injected link component, or move the current `NavLink` + search integration to the **client** layer.
- **Storybook coverage** for exported components that currently have no stories: at minimum **Loader**, **Error**, **ErrMessage**, **UploadLabel**, and the refactored **tag** UI (plus any thin client wrapper if split).
- **Document field patterns**: short, repo-local guidance (design doc or README section) on when to use **Field + Input** vs **LabeledInput**, and the role of deprecated **TextField**.
- **Exports and migration**: update `ui-kit` `index.ts` and **`client/src/shared/ui`** re-exports as needed; **BREAKING** only if public `TagList` API or export surface changes in a way that requires call-site updates (prefer a compatibility re-export or deprecation period if feasible).

## Capabilities

### New Capabilities

- `ui-kit-taglist-boundaries`: Requirements for presentational tag/chip UI in the kit vs app-specific routing and URL state; acceptable extension points (render prop, `asChild`, optional wrapper).

- `ui-kit-storybook-coverage`: Requirements for which exported ui-kit components MUST have Storybook stories and what each story set should demonstrate (at least default + one meaningful variant per component class).

### Modified Capabilities

- `ui-kit-package`: Extend requirements so that **Storybook coverage** is explicitly tied to **exported** components (aligned with `ui-kit-storybook-coverage`), and add a **non-normative or normative** note that kit components SHOULD NOT depend on application routing unless documented as an exception (supports the boundaries goal without duplicating all of `ui-kit-taglist-boundaries` in the base package spec).

## Impact

- **`ui-kit/`**: `TagList` refactor or split; possible new files for presentational chips; new/updated `.stories.tsx`; `index.ts` exports; optional move of `buildSearchParams` usage to `client` or `shared` if it leaves the kit.
- **`client/`**: Imports from `@/shared/ui` or `@shevdi-home/ui-kit` updated wherever `TagList` (or successors) are used; tests that mock `TagList` may need adjustment.
- **OpenSpec**: New specs under this change; delta-style updates to `openspec/specs/ui-kit-package/spec.md` when the change is applied (per project archive workflow).
