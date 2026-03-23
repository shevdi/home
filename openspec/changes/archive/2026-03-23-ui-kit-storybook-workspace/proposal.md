## Why

The app needs a shared, versionable UI layer built on the same stack as [Radix Themes](https://github.com/radix-ui/themes) so components stay consistent and testable outside the client. Today `ui-kit/` is only a README; there is no package, Storybook, or build path, so there is nowhere to develop with HMR or ship a built artifact the client can import. Establishing a workspace package with Storybook-first development and a required build step for client integration closes that gap and sets up a path to publishing and multi-app/SSR use later.

## What Changes

- Add **`ui-kit` as an npm workspace package** with its own `package.json`, dependencies (including Radix UI / Radix Themes per project conventions), and a **production build** that emits JS/CSS/types suitable for the client bundler.
- Add **Storybook** for the ui-kit with **HMR** as the primary inner loop for component development.
- Document and implement the **client integration rule**: the client consumes the **built output** (not Storybook); integrating or updating the kit in the app requires **building** the package (with optional watch mode for developer ergonomics).
- Add **Docker** support aligned with the repo: a dev-oriented setup for consistent local Storybook/build, and a CI-oriented path so merge checks use the same build as local (details in design).
- **Later (out of initial scope or follow-up)**: publish the package to a registry, deploy static Storybook to GitHub Pages, and explicitly validate **multiple apps** and **SSR**—these are anticipated extensions, not blockers for the first deliverable.

## Capabilities

### New Capabilities

- `ui-kit-package`: Workspace package layout; Radix Themes–aligned stack; Storybook dev with HMR; build output and scripts; how the client depends on the built artifact; Docker dev/CI alignment; phased notes for npm publish, Storybook on GitHub Pages, multi-app, and SSR.

### Modified Capabilities

- _(none)_ — No existing OpenSpec capability defines ui-kit behavior; CI workflow requirements may be extended in implementation, but no current spec is superseded at the requirements level until a separate change explicitly deltas `ci-workflow` if needed.

## Impact

- **Root `package.json`**: `workspaces` will include `ui-kit`; root scripts may delegate build/dev for the kit.
- **`client/`**: Will add a dependency on the workspace package and import from the built entry; client bundle config may need to resolve the package (and peer/style implications for Radix Themes).
- **New files**: `ui-kit/` package source, Storybook config, optional `Dockerfile`(s), and ignore patterns for build output as needed.
- **Developer workflow**: Inner loop in Storybook; outer loop build (or `build --watch`) when testing in the client.
