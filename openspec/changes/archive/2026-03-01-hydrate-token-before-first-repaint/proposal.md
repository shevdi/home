## Why

When an authenticated user navigates directly to a protected route (e.g. `/photos/new`) via bookmark, typed URL, or page refresh, they are incorrectly redirected to login. The root cause is a timing race: `PersistLogin` triggers a refresh-token request asynchronously but renders children immediately. `RequireAuth` checks auth state before the refresh completes, sees no token, and redirects. The fix is to hydrate the auth token before the first repaint so protected routes have correct auth state when they render.

## What Changes

- Run the refresh-token request before React mounts (or before protected routes render)
- Ensure auth state is populated in Redux before any `RequireAuth` check runs
- Preserve existing behavior for client-side navigation (no regression)
- No change to login flow, logout flow, or API contracts

## Capabilities

### New Capabilities

- `auth-session-hydration`: Auth token is restored from refresh-token cookie before the first paint. Protected routes receive correct auth state on initial load, direct navigation, and page refresh.

### Modified Capabilities

- (none)

## Impact

- **client/src/app/entry**: Entry point or bootstrap logic must await refresh before rendering
- **client/src/features/Auth**: May need to expose a pre-mount refresh function or move refresh earlier
- **client/src/app/store**: Redux store must be available before React mount for pre-mount refresh
- **Dependencies**: No new dependencies; uses existing refresh endpoint and auth slice
