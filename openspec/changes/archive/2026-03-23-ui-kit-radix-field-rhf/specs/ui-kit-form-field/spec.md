# UI Kit Form Field

## ADDED Requirements

### Requirement: Field layout component

The `ui-kit` package SHALL export a `Field` component that supports a **shorthand** form and a **compound** form. The shorthand SHALL accept at least `label`, optional `description`, optional `error` (string or undefined), optional `required`, and a single child **control** (e.g. `TextField`). The compound form SHALL expose `Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, and `Field.Error` such that consumers can arrange structure for non-standard layouts. Both forms SHALL share the same accessibility contract: stable association between label and control, error and description exposed to assistive technologies via appropriate `aria-*` attributes and ids.

#### Scenario: Shorthand renders label and error

- **WHEN** Storybook or a client screen renders `Field` in shorthand form with `label`, `error`, and a text control child
- **THEN** the label is associated with the control, the control exposes invalid state when `error` is non-empty, and the error message is exposed to assistive technologies

#### Scenario: Compound allows custom order

- **WHEN** a consumer uses `Field.Root` with `Field.Label`, `Field.Control`, `Field.Description`, and `Field.Error` in a non-default order required by design
- **THEN** ids and `aria-describedby` (or equivalent) still reference the correct elements for the control

### Requirement: TextField control

The `ui-kit` package SHALL export a `TextField` component that renders a native text-capable input (or appropriate input type) suitable for use inside `Field.Control`, forwards refs for **react-hook-form** `register`, and passes through standard input HTML attributes without breaking existing client usage patterns.

#### Scenario: register spread works

- **WHEN** a client passes `{...register('fieldName')}` to `TextField` inside a `Field`
- **THEN** the input receives the ref and name from `register` and participates in form submission and validation as before

### Requirement: React Hook Form is external

The `ui-kit` package SHALL NOT depend on `react-hook-form` as a runtime dependency. Form state, validation, and submit handling SHALL remain in the client; `Field` and `TextField` SHALL be presentational and accept values such as `error` from the caller.

#### Scenario: No RHF in ui-kit package.json

- **WHEN** a reviewer inspects `ui-kit/package.json` dependencies
- **THEN** `react-hook-form` is not listed as a dependency or peerDependency of `ui-kit`

### Requirement: Storybook coverage for Field and TextField

The `ui-kit` package SHALL include Storybook stories that demonstrate shorthand `Field`, compound `Field`, and `TextField` usage, including an example pattern compatible with react-hook-form (documentation-only or mock handlers acceptable).

#### Scenario: Stories exist

- **WHEN** a developer runs Storybook for `ui-kit`
- **THEN** they can open stories for `Field` and `TextField` and see the documented variants
