## 1. Schema and migration

- [x] 1.1 Resolve `email` strategy for Telegram-only users (optional field vs placeholder) and document in code
- [x] 1.2 Update Mongoose user schema: optional `password`, unique `name`, `telegram` subdocument with unique sparse index on `telegram.userId`
- [x] 1.3 Add migration or one-off script to deduplicate existing `name` values before unique index, if needed — documented in README for production; no duplicates in dev seeds
- [x] 1.4 Apply indexes and verify existing password users still authenticate

## 2. Server config

- [x] 2.1 Extend zod env config with `TELEGRAM_BOT_TOKEN` and `TELEGRAM_PENDING_SECRET` (or agreed names), validated at startup
- [x] 2.2 Add config for maximum `auth_age` (seconds) for Telegram `auth_date` checks

## 3. Telegram verification and tickets

- [x] 3.1 Implement Telegram hash verification helper (data-check string + HMAC) using bot token from config
- [x] 3.2 Implement short-lived pending-registration JWT (or signed blob) with `typ` claim and `telegram_user_id`; document TTL
- [x] 3.3 Add rate limiters for new Telegram auth routes consistent with login limiter

## 4. Auth API

- [x] 4.1 Add `POST` endpoint: accept widget payload, verify, return `{ pendingTicket, suggestedName? }` or issue full session when returning user with existing linked account and complete profile per spec
- [x] 4.2 Add `POST` endpoint: accept `pendingTicket` + `name`, enforce uniqueness, create or update user, issue access + refresh cookies same as password login
- [x] 4.3 Ensure returning Telegram user with stored `telegram.userId` gets session without name step when `name` already set
- [x] 4.4 Map duplicate `name` to HTTP 409 with stable error shape for client

## 5. Password login compatibility

- [x] 5.1 Update password login to reject users without password; keep bcrypt path for users with password
- [x] 5.2 Adjust any user creation paths that assumed required password

## 6. Client

- [x] 6.1 Embed Telegram Login Widget on login page (script load, `data-telegram-login`, callback)
- [x] 6.2 Add RTK Query mutations for Telegram verify and complete-name; wire `setCredentials` on success
- [x] 6.3 Add name step UI (pre-fill from `suggestedName`, required when absent); handle 409
- [x] 6.4 Ensure unauthenticated shell until tokens issued; align with `auth-session-hydration` behavior

## 7. Mock server and E2E

- [x] 7.1 Extend mock server auth stubs if tests hit auth endpoints — not required; E2E uses real API `POST /auth` only
- [x] 7.2 Add or update e2e coverage for login flows as feasible (Telegram may be stubbed or skipped in CI with documented reason)

## 8. Ops and documentation

- [x] 8.1 Document BotFather domain setup and env vars for deployers
- [x] 8.2 Note CSP allowlist for Telegram widget if production uses strict CSP
