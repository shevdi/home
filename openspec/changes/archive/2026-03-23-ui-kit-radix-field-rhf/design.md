## Context

The client already uses **react-hook-form** with **zod** resolvers and imports presentation components from **`@shevdi-home/ui-kit`** via `client/src/shared/ui`. The ui-kit package is built with Vite; Storybook documents components. Existing `Button`, `Input`, and `Checkbox` are plain DOM/CSS. **Dropdown** already uses `@radix-ui/react-select`. The archived and live OpenSpec capability **`ui-kit-package`** currently requires Radix Themes alignment and a Theme provider in Storybook; this change narrows that to **headless primitives + project CSS** for new/refactored form controls while keeping optional Themes for stories that need it.

## Goals / Non-Goals

**Goals:**

- Use **headless Radix** for behavior and accessibility primitives where they exist (Checkbox, Label; Slot/primitive for Button composition).
- Keep **all form state, validation, and submit logic in React Hook Form** (and zod) in the client; ui-kit remains **presentational**.
- Ship a **`Field`** API with both **shorthand** and **compound** variants, sharing one internal strategy for `id`, `aria-describedby`, `aria-invalid`, and `aria-required`.
- Provide **`TextField`** as the standard text input for use inside `Field`, with **ref forwarding** for `register()`.
- Prove integration by migrating **at least Login** to `Field` + `TextField` (and updated Button/Checkbox if touched).

**Non-Goals:**

- Adopting **`@radix-ui/react-form`** (or Radix Form) as the validation or state layer.
- Replacing **styled-components** in the client in this change.
- **Radix Themes** as the default visual system for these components (no requirement to wrap the app in Theme for the new Field stack).
- Migrating every form in the repo in one pass (**UploadPhoto**, **EditPage**, etc. are follow-ups).

## Decisions

### 1. Headless Radix + CSS modules

**Choice:** Style all surfaces with existing **CSS modules**; Radix components are unstyled or minimally styled by Radix.

**Rationale:** Matches the user’s direction; avoids pulling Themes tokens into every component.

**Alternatives:** Radix Themes (`@radix-ui/themes`) — rejected for default styling in this change.

### 2. Button: Slot vs native only

**Choice:** Use **`@radix-ui/react-slot`** (or `Primitive` from `@radix-ui/react-primitive` if already pulled in) so `Button` can support **`asChild`** when needed; default render remains `<button>`.

**Rationale:** There is no `@radix-ui/react-button`; Slot is the idiomatic Radix pattern.

**Alternatives:** Plain `<button>` only — simpler but less composable.

### 3. Checkbox: `@radix-ui/react-checkbox`

**Choice:** Implement the interactive control with Radix Checkbox root + indicator; preserve **controlled** API (`checked`, `onChange` with boolean) for compatibility with **Controller** in RHF.

**Rationale:** Radix provides focus, keyboard, and state semantics; maps to existing `CheckboxProps` shape.

### 4. Input → TextField + Label

**Choice:** Introduce **`TextField`** as the primary text input export (forwardRef, passes through native input props). Refactor **`Input`** to compose **`TextField`** + **`Field`**-friendly labels, or deprecate `Input` in favor of `Field` + `TextField` for new code; **keep `Input` as an alias or thin wrapper** until call sites migrate.

**Rationale:** Clear separation between “field chrome” (Field) and “control” (TextField). Radix has no text-input primitive; **`@radix-ui/react-label`** associates label with control id.

**Alternatives:** Rename `Input` only — possible but “TextField” matches the proposed API and common design-system naming.

### 5. Field architecture

**Choice:** Implement **compound components** (`Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`) with **React context** holding generated ids, error message, `required` flag, and `invalid` state. Implement the **shorthand** `<Field label …><TextField /></Field>` as sugar that renders the same tree (e.g. `Field.Root` with default slots).

**Rationale:** One a11y model; shorthand avoids repetition for simple forms.

**Alternatives:** Shorthand only — faster to ship but blocks complex layouts.

### 6. RHF integration

**Choice:** Pass **`error` from `formState.errors`** (string) into `Field`; use **`register` spread** on `TextField` or **`Controller`** for Checkbox. No new form library dependencies in ui-kit.

**Rationale:** Keeps a single source of validation truth (zod + RHF).

### 7. Storybook and Theme

**Choice:** New stories for **Field** and **TextField** do **not** require **Radix Themes**; existing preview may keep Theme if other stories still need it; document that **Theme is optional** for form-field stories.

**Rationale:** Aligns with updated `ui-kit-package` delta.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Breaking** changes to `Input`/`Checkbox`/`Button` props or DOM structure | Preserve public props where possible; use Storybook and migrate Login first to catch regressions. |
| **Bundle size** from multiple `@radix-ui/*` packages | Share `@radix-ui/react-primitive` / compose-refs where possible; tree-shake; document in Vite externals if needed. |
| **Duplicate ids** when users compose Field incorrectly | Document compound usage; consider dev-only warnings for missing Control. |
| **file** `Input` type with `UploadLabel` | Keep specialized path in `Input` or split **file upload** into a separate story/task if refactor breaks dropzone flows. |

## Migration Plan

1. Land ui-kit changes + build; update `shared/ui` exports.
2. Migrate **Login**; smoke-test auth flow.
3. Optionally migrate other forms in follow-up PRs; remove `Input` alias only when unused.

Rollback: revert client and ui-kit commits; no server or API changes.

## Open Questions

- Whether **`Input`** remains a long-term export or is **deprecated** in favor of `Field` + `TextField` for all text-like fields (decision can be deferred until after Login migration).
- Exact **Vite** `optimizeDeps` / `ssr` entries for new Radix packages if dev server issues appear.
