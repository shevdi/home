## Context

The app is a React + webpack client (`shevdi-home-front`) with existing photo flows and Drime-related APIs. There is no PWA manifest or service worker today. The product target for v1 is **installed PWA on desktop** (Chrome/Edge-class browsers), not mobile-first.

## Goals / Non-Goals

**Goals:**

- Ship a **installable** PWA with a **standalone** window as the primary experience.
- **Layered** photo loading: `navigator.onLine` → `fetch` → **SW cache** fallback before declaring failure.
- **Distinct** user-facing states for photo slots: fully offline vs load failure (including lie-fi).
- **Cache photo responses in the background** while online for future use; **v1 rule**: when offline, photo slots still show only **«Нет интернета»** (no “show cached image” in v1).
- **No uploads** anywhere in v1.

**Non-Goals:**

- Electron or native file-system sync (later phase).
- iOS Safari PWA parity (desktop-first; document gaps if needed).
- Showing cached photos in offline mode in v1 (explicitly deferred; cache exists for future or faster online paths).

## Decisions

1. **Order of checks for photo slots**  
   - **First** `navigator.onLine === false` → treat as **fully offline** immediately → show **«Нет интернета»** (avoid long timeouts).  
   - **Else** attempt **fetch** (or `fetch` + `blob` / `<img>` with SW-controlled URLs—implementation detail) to load the resource.  
   - **If fetch fails**, try **service worker cache** match for that request (or versioned cache key strategy).  
   - **If still no image**, classify: if we already know “fully offline” from step 1, offline copy; else **«Не удалось загрузить фото»** (lie-fi, server error, CORS, etc.).

2. **Why not rely on `navigator.onLine` alone**  
   It is optimistic and misses captive portals and lie-fi; hence **fetch** + **cache** after the fast offline short-circuit.

3. **Service worker tooling**  
   Prefer **Workbox** or a minimal hand-written SW—choice left to implementer; must support **runtime caching** of photo GETs and **precache** of shell assets. Document the choice in code comments or README snippet.

4. **Copy strings**  
   Use the exact Russian strings from specs for v1; wire through a single small map or i18n-ready structure so EN can be added later without rewriting logic.

5. **Uploads**  
   Hide or remove entry points (routes, buttons) for photo upload in v1; if dead code remains, it MUST be unreachable in production build.

6. **Global offline toast**  
   Use **@shevdi-home/ui-kit** `Toast` with `variant="warning"`. Do **not** render `Toast.Close`. Drive visibility with **`useIsOnline()`** (or equivalent): toast **open** while offline, closed when online. Use **`duration={Infinity}`** on the offline **`Toast.Root`** so it does not auto-dismiss while still offline. If feature-level copy (e.g. Photos gallery banner) overlaps, consolidate or remove redundancy so the user is not spammed with duplicate offline messages on one screen.

7. **Connection restored toast**  
   On transition **offline → online** (`navigator.onLine` was `false`, then `true`), show **`variant="success"`** with copy **Соединение восстановлено** and **`duration={10000}`** (10 s). Implement with a **`useRef`** (or equivalent) for the previous online value so the success toast does **not** fire on initial load when already online.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| SW updates leave users on stale bundles | Versioned SW + `skipWaiting` / client reload messaging per project norms |
| Large photo cache evicts shell cache | Separate cache names / quotas; cap photo cache size if needed |
| `navigator.onLine` false while cache could serve image | v1 explicitly does not show cached photos offline; document for v2 |
| Drime URLs cross-origin | CORS and SW `fetch` handling must match actual response headers |

## Migration Plan

- Ship SW + manifest behind normal deploy; first visit registers SW; existing users get update on next load.
- No database migration.

## Open Questions

- Exact **Workbox** vs **custom SW** (resolve during implementation).
- Whether **E2E** will simulate offline via Playwright `context.setOffline`—optional follow-up task.
