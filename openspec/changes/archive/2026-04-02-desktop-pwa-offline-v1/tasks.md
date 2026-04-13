## 1. PWA shell and build

- [x] 1.1 Add `manifest.webmanifest` (name, icons, `display: standalone`, `start_url`, theme) and link it from the client HTML template.
- [x] 1.2 Add webpack (or copy plugin) steps so manifest and icons ship under public paths; ensure HTTPS/local dev still works.
- [x] 1.3 Register the service worker from the client bootstrap with a safe update strategy.

## 2. Service worker and caching

- [x] 2.1 Implement service worker (Workbox or hand-rolled) with precache for shell assets and runtime caching for photo GETs.
- [x] 2.2 Use separate cache names or strategies for app shell vs photos; document quota/cleanup approach.
- [x] 2.3 Verify SW activates and controls the app in standalone mode after install.

## 3. Photo pipeline and UI states

- [x] 3.1 Implement layered loading for photo slots: `navigator.onLine` → fetch → SW cache fallback (align with `client-desktop-pwa` spec).
- [x] 3.2 Map states to copy: fully offline → **«Нет интернета»**; not fully offline but image unresolved → **«Не удалось загрузить фото»** (lie-fi covered).
- [x] 3.3 Ensure v1 offline photo slots never show cached images even if cache exists (per spec).
- [x] 3.4 Centralize Russian strings (or i18n keys) so future locales do not require logic changes.

## 4. No uploads (v1)

- [x] 4.1 Remove, hide, or disable all user-facing photo upload entry points; confirm production bundle has no reachable upload flow.

## 5. Verification

- [ ] 5.1 Manually test: installed PWA, `navigator.onLine` false, online + blocked image URL, online + flaky network.
- [ ] 5.2 Optional: add or extend E2E coverage for offline / failed image if the suite supports network emulation.

## 6. Global offline warning toast

- [x] 6.1 Mount **Toast.Provider** and **Toast.Viewport** once at the app shell (e.g. alongside existing providers), using ui-kit Toast and existing `label`/accessibility patterns from Storybook.
- [x] 6.2 Implement an **offline toast** driven by **`useIsOnline()`**: **warning** variant, **no** `Toast.Close`; copy consistent with centralized PWA strings (or a dedicated key next to `pwaPhotoMessages`).
- [x] 6.3 Keep the toast visible for the whole offline period (controlled `open` and/or provider `duration` so it does not disappear on a short timeout while still offline); ensure returning online hides it.
- [x] 6.4 Reconcile with **Photos** offline UI: remove any debug forced-offline code, avoid duplicate redundant offline messaging on the same view (per design §6).
- [ ] 6.5 Include offline toast behavior in **5.1** manual test pass (DevTools offline / airplane mode as applicable).
- [x] 6.6 On **offline → online** transition, show **success** toast **Соединение восстановлено** for **10 seconds** (per spec); do not show on first paint when already online.
