## 1. Pre-mount auth hydration

- [x] 1.1 Add `hydrateAuth` bootstrap function that dispatches the refresh mutation and awaits it (catch and ignore failures)
- [x] 1.2 Call `hydrateAuth` in `client/src/index.tsx` before `createRoot().render()`, using the existing store
- [x] 1.3 Ensure `authApiSlice` and `store` are importable from the entry point (no circular deps)

## 2. Verification

- [x] 2.1 Run E2E test "authenticated admin can access upload page" and confirm it passes with direct navigation to `/photos/new`
- [x] 2.2 Manually verify: refresh page while on `/photos/new` as authenticated user — page stays, no redirect to login
