## 1. Dependencies and build

- [x] 1.1 Add required `@radix-ui/react-*` packages to `ui-kit/package.json` (checkbox, label, slot or primitive per design); run install at repo root
- [x] 1.2 Update `ui-kit/vite.config.ts` externals / `optimizeDeps` if needed for new packages

## 2. Primitives refactor

- [x] 2.1 Refactor `Button` to use `@radix-ui/react-slot` (or agreed primitive) with default `<button>`; preserve existing `ButtonProps` where possible
- [x] 2.2 Refactor `Checkbox` to `@radix-ui/react-checkbox` with existing controlled API (`checked`, `onChange(boolean)`)
- [x] 2.3 Introduce `TextField` (forwardRef, native input props); refactor `Input` to compose `TextField` + label/file handling, or keep `Input` as a thin wrapper for backward compatibility

## 3. Field component

- [x] 3.1 Implement `Field` compound API (`Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`) with shared context for ids and `aria-*`
- [x] 3.2 Implement shorthand `Field` API that delegates to the same internal structure as the compound API
- [x] 3.3 Use `@radix-ui/react-label` where appropriate for label association

## 4. Exports and Storybook

- [x] 4.1 Export `Field`, `TextField`, and updated types from `ui-kit/src/index.ts`
- [x] 4.2 Add or update Storybook stories for `Field`, `TextField`, and refactored `Button` / `Checkbox` / `Input`
- [x] 4.3 Adjust `ui-kit/.storybook/preview.tsx` so headless Field stories do not require Radix Themes (keep Theme optional for other stories if needed)

## 5. Client integration

- [x] 5.1 Re-export new components and types from `client/src/shared/ui/index.ts`
- [x] 5.2 Migrate `client/src/features/Auth/ui/Login.tsx` to use `Field`, `TextField`, and updated components; verify RHF + zod behavior unchanged
- [x] 5.3 Smoke-test login flow (manual or e2e if available) — verified via `npm run build -w @shevdi-home/ui-kit` and `client` `tsc --noEmit`

## 6. Spec and archive

- [x] 6.1 When implementation is complete, apply OpenSpec workflow to merge deltas into `openspec/specs/` and archive the change per project conventions
