## Why

The web client should behave as a **desktop-first installable PWA** with predictable behavior when the network is missing or unreliable. Photo content comes from remote sources (including Drime); users need clear copy for **fully offline** vs **online but image failed** (lie-fi), and v1 remains **read-only** with **no photo uploads**. Photos fetched while online should be **cached in the background** for future use without changing v1 offline photo UI.

## What Changes

- Add **PWA shell**: web app manifest, **service worker** registration, and install path targeting an **installed standalone window** (desktop-first).
- Implement a **layered connectivity and load pipeline** for photos: `navigator.onLine` (fast offline) → **fetch** (real reachability) → **service worker cache** fallback when fetch fails.
- **Photo slots** MUST show **«Нет интернета»** when fully offline and **«Не удалось загрузить фото»** when online (or lie-fi) but the image cannot be resolved after fetch + cache fallback—so lie-fi never looks like “offline”.
- **Background caching** of photo responses when online; **offline v1** still shows only the offline message in photo slots (cache does not change that UX in v1).
- **Remove or disable** user-facing **photo upload** flows for v1 (no uploads online or offline).
- Show an **app-wide offline indicator**: a **warning** toast (ui-kit) while `navigator.onLine` is false, **without** a close button; it disappears when the browser reports online again.
- When connectivity is **restored** after being fully offline, show a **success** toast **Соединение восстановлено** for **10 seconds**.

## Capabilities

### New Capabilities

- `client-desktop-pwa`: PWA installability (desktop-first, standalone), service worker strategy, layered network detection for photos, photo slot messages (offline vs load failure), lie-fi handling, background photo caching with v1 offline UI rules, v1 read-only / no-upload behavior, global offline warning toast (no dismiss control), and a success toast on reconnection (**Соединение восстановлено**, 10 s).

### Modified Capabilities

- (none)

## Impact

- **`client/`**: manifest, service worker, registration bootstrap, photo loading components or hooks, webpack/build config for PWA assets, possible HTML template updates.
- **E2E / tests**: scenarios for offline vs failed image load if the suite covers network conditions.
- **Future**: Electron storage-only agent remains out of scope for this change; this proposal does not add Electron.
