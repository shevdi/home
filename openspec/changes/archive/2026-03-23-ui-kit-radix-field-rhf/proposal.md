## Why

`@shevdi-home/ui-kit` still implements core controls as raw HTML with ad hoc accessibility wiring, while the repo already standardizes on Radix for some components (e.g. Select) and on **react-hook-form + zod** in the client. Introducing **headless Radix primitives** for interactive controls, a shared **Field** layout for labels/descriptions/errors, and a **TextField**-style control keeps validation and state in RHF while improving a11y and consistency. Doing this now aligns the kit with prior exploration decisions (no Radix Form as state layer, project-owned CSS).

## What Changes

- Refactor **Button**, **Checkbox**, and **Input** to use appropriate **headless Radix** pieces (`Slot` / primitive button where useful, `@radix-ui/react-checkbox`, `@radix-ui/react-label`, etc.) while **styling remains project CSS modules** (no Radix Themes as the default look).
- Add a **`TextField`** component (thin wrapper around the text input concern) suitable for use inside **Field** and with `register`/`ref` forwarding for RHF; retain or alias **`Input`** if needed for backward compatibility during migration.
- Add **`Field`**: a convenience API (`label`, `description`, `error`, `required`, children) and a **compound API** (`Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`) sharing one internal model for ids and `aria-*` wiring.
- **Export** new APIs from `ui-kit` entry; **re-export** from `client/src/shared/ui` where appropriate.
- **Migrate** at least one representative client form (e.g. **Login**) to the new `Field` + `TextField` pattern as proof of RHF integration; additional screens can follow incrementally.
- **Dependencies**: add Radix packages required by the above (e.g. `react-checkbox`, `react-label`, `react-slot`; exact set per design).

## Capabilities

### New Capabilities

- `ui-kit-form-field`: Field compound and shorthand APIs; TextField; accessibility contracts (label/control association, describedby for description and error, invalid state); compatibility with react-hook-form (refs and spread props); Storybook coverage.

### Modified Capabilities

- `ui-kit-package`: Update normative requirements so the stack is **headless Radix UI primitives + project CSS** (Radix Themes optional, not required for core form controls) and adjust Storybook-related expectations accordingly; clarify production build/CSS wording.

## Impact

- **`ui-kit/package.json`**: new `@radix-ui/*` dependencies; possible bundle externals in Vite.
- **`ui-kit/src`**: Button, Checkbox, Input, new Field + TextField modules, CSS modules, `index.ts` exports, Storybook stories.
- **`client/src/shared/ui/index.ts`**: exports/types for Field, TextField (and any renames).
- **`client` feature forms**: incremental adoption starting with Login; no change to RHF/zod/RTK patterns beyond JSX composition.
- **OpenSpec**: delta under `openspec/specs/` when the change is applied/archived per project workflow.
