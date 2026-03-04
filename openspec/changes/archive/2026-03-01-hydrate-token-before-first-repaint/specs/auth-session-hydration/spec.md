## ADDED Requirements

### Requirement: Auth token is hydrated before first paint

The system SHALL attempt to restore the auth session from the refresh-token cookie before the first React render. Protected routes SHALL receive correct auth state (token present or absent) when the user loads the app via direct navigation, bookmark, or page refresh.

#### Scenario: Authenticated user loads protected route directly

- **WHEN** a user with a valid refresh-token cookie navigates directly to a protected route (e.g. `/photos/new`) via URL, bookmark, or page refresh
- **THEN** the refresh request completes before the route renders, the token is stored in Redux, and the protected page is displayed (no redirect to login)

#### Scenario: Unauthenticated user loads protected route directly

- **WHEN** a user without a refresh-token cookie navigates directly to a protected route
- **THEN** the refresh request fails or returns no token, the app renders with token null, and RequireAuth redirects to login

#### Scenario: Client-side navigation unchanged

- **WHEN** an authenticated user navigates from one page to a protected route via in-app links (client-side navigation)
- **THEN** the protected page displays without redirect, as before
