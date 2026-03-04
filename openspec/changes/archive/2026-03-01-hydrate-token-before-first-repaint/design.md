## Context

The app uses React Router with `PersistLogin` (runs refresh in `useEffect`) and `RequireAuth` (checks Redux auth state). On direct load of a protected route, `RequireAuth` renders before the refresh completes, sees `token: null`, and redirects to login. The store and auth slice already exist; the refresh mutation in `authApiSlice` populates the token on success. The entry point is `client/src/index.tsx`; it renders immediately with no pre-mount logic.

## Goals / Non-Goals

**Goals:**
- Hydrate auth token from refresh-token cookie before the first React render
- Ensure protected routes receive correct auth state on initial load, direct navigation, and page refresh
- Preserve existing login, logout, and client-side navigation behavior

**Non-Goals:**
- Changing the refresh API, auth slice shape, or RequireAuth logic
- Adding a loading/splash screen (we render only after hydration attempt completes)
- Server-side rendering or SSR changes

## Decisions

### 1. Pre-mount refresh in entry point

**Decision:** Run the refresh request in `index.tsx` before `createRoot().render()`, using the existing store and `authApiSlice` refresh mutation.

**Rationale:** Keeps all auth logic in one place; no new abstractions. The store is already created before App mounts (App receives it via Provider). We move the "first refresh" earlier so it completes before any component reads auth state.

**Alternative considered:** Have `PersistLogin` block rendering until refresh completes. Rejected because it would require PersistLogin to show a loading state and coordinate with RequireAuth, adding complexity. Pre-mount is simpler and fixes the root cause.

### 2. Fire-and-forget vs await

**Decision:** Await the refresh promise before rendering. If it fails (no cookie, network error), proceed with `token: null` and render normally.

**Rationale:** We need the token in the store before RequireAuth runs. Awaiting ensures that. Failures are expected (unauthenticated users) and should not block rendering.

**Alternative considered:** Render immediately with a loading overlay. Rejected to avoid extra UI and flash of content.

### 3. Store creation before render

**Decision:** Import the store from `@/app/store/store`, dispatch the refresh mutation, await it, then render. No changes to store creation.

**Rationale:** The store is a singleton. We can dispatch before React mounts. RTK Query's `initiate` returns a promise we can await.

### 4. PersistLogin behavior after change

**Decision:** Keep `PersistLogin` and its `useEffect` refresh call. It will run again on mount but will be a no-op if we already have a token (or will refresh if token expired). No removal of PersistLogin.

**Rationale:** PersistLogin handles refresh on subsequent navigations and tab focus. Pre-mount handles the initial load. Both can coexist; the second refresh is cheap if the first succeeded.

**Alternative considered:** Remove PersistLogin's refresh. Rejected because we may need periodic refresh or refresh on focus; keeping it is safer.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Slightly longer time-to-first-paint for users with refresh cookie | Acceptable; one extra network request before paint. Typically &lt;200ms. |
| Refresh fails (network, no cookie) and we block | We await but catch; on failure we proceed with null token and render. No infinite wait. |
| Double refresh (pre-mount + PersistLogin) | Both run; second may be redundant. Low cost; can optimize later if needed. |

## Migration Plan

- No migration or rollback needed. Single deploy.
- E2E tests (especially "authenticated admin can access upload page" with direct navigation) should pass after change.
