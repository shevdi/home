# UI Kit (`@shevdi-home/ui-kit`)

Shared UI for the monorepo: **CSS Modules** for component styles, **design tokens** as CSS variables, **Vite** for the library build. No `styled-components` and no Radix Themes in this package.

## Design tokens

- Source: [`src/styles/tokens.css`](src/styles/tokens.css) — shared radii, shadows, spacing scale, and semantic colors.
- Theme switching: set `document.documentElement.dataset.theme` to `'light'` or `'dark'` (the client does this from Redux).
- Built stylesheet: after `npm run build`, import the single bundle in the app entry:

```ts
import '@shevdi-home/ui-kit/style.css'
```

## Components

Form controls, feedback, `TagChips`, `Calendar`, etc. live under `src/components/`. Each component has a `*.module.css` file.

### Forms: `Field` + `Input` vs `LabeledInput`

- **`Field` + `Input`** — Prefer for new screens: Radix `Label`, generated ids, `aria-describedby` for description and error, and RHF-friendly `Field.Control`. Use **`Input`** (primitive) inside **`Field.Control`** or the **`Field`** shorthand with a single child control.
- **`LabeledInput`** — Legacy-friendly labeled row (label + input + error) with optional file upload and `onOutsideClick`. Use when you are not migrating to `Field` yet or need that specific layout.

`TagChips` is the presentational tag row in the kit (no router). **`TagList`** (links + photo search URLs) lives in the client (`client/src/shared/ui/TagList.tsx`) next to **`MapEmbed`**, because it depends on `react-router` and `buildSearchParams`.

## Development

**Storybook** (HMR):

```bash
npm run storybook --workspace=@shevdi-home/ui-kit
```

**Build the library:**

```bash
npm run build --workspace=@shevdi-home/ui-kit
```

**Watch build** (when testing in the client):

```bash
npm run build:watch --workspace=@shevdi-home/ui-kit
```

Root `npm run build` runs `build:ui-kit` first, then the client webpack build.

## Workspace vs npm package

The package is consumed via `file:../ui-kit` from the client. Publishing to a registry is a later step.

## Docker / CI

See existing `ui-kit/Dockerfile.dev` and CI `build:ui-kit` step.
