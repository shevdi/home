## Context

The app today uses **username + password** (bcrypt), **JWT access** + **refresh cookie**, and a MongoDB `user` model with **required** `email`, `name`, and `password`. There is no federated login.

Telegram’s **Login Widget** returns signed fields in the browser; the server **must** verify the `hash` using the **bot token** before treating the user as authenticated. Product decisions already agreed:

- **Way A**: no full session (no access/refresh pair used for normal API auth) until a **unique** `name` exists.
- If Telegram provides **`@username`**, use it as the **default** display name (user may change before confirm).
- If **no** `@username`, the user **must** enter a name (required step).
- New Telegram sign-ups get **`role: user`**.
- **One** app user record holds **Telegram id** metadata; optional **password** remains for password-based users.

## Goals / Non-Goals

**Goals:**

- Secure Telegram identity verification aligned with Telegram’s documented algorithm.
- **Registration ticket** bridging Telegram success and name completion without granting full API access.
- **Unique `name`** enforced at persistence (unique index) with clear conflict handling in UI/API.
- **typed env** for bot token and any ticket-signing secret.

**Non-Goals:**

- Full generic OAuth2 provider framework.
- Telegram Bot API messaging beyond what the Login Widget needs for verification.
- Account linking flows for an **existing** password user connecting Telegram in settings (can be a follow-up).

## Decisions

### 1. Verification algorithm

**Choice:** Implement Telegram’s official **data-check-string** + **HMAC-SHA256** check using the bot token (see Telegram Login Widget docs).

**Alternatives:** Trust client-only data (rejected — insecure).

### 2. Registration ticket (Way A)

**Choice:** Issue a **short-lived signed token** (e.g. JWT or HMAC-signed blob) after successful hash verification, containing at minimum **`telegram_user_id`** and **`typ: pending_telegram_name`** (or equivalent), **TTL ≈ 5–15 minutes**. Client sends this token only to **`POST /auth/telegram/complete-name`** (name TBD) with the chosen `name`. Server validates ticket, enforces **unique** `name`, creates or updates user, then issues **normal access + refresh** as today.

**Alternatives:**

- Server-side session store (Redis) for pending state — stronger if multi-node consistency is required; heavier operationally.
- Full JWT with `profileIncomplete` — rejected per Way A.

**Ticket signing key:** Use a **dedicated env secret** (e.g. `TELEGRAM_PENDING_SECRET`) separate from JWT access/refresh secrets to limit blast radius; document in `typed-env-config`.

### 3. User model

**Choice:**

- `password`: **optional** (omit or null for Telegram-only).
- `name`: **required**, **globally unique** (case rules TBD in implementation; document in spec — recommend consistent normalization).
- `email`: existing field — decide migration default for Telegram-only (e.g. placeholder `telegram-{id}@local.invalid` or make email optional) — **open** in Open Questions if not resolved in implementation.
- `telegram`: embedded object `{ userId: number, username?: string }` with **`telegram.userId` unique** sparse index.

**Alternatives:** Separate `telegram_users` collection — more joins; single document preferred.

### 4. Default name when `@username` exists

**Choice:** Pre-fill UI with `@username` (or string without `@` per product — clarify in UI copy). User confirms or edits; submit runs **uniqueness** check.

### 5. Client integration

**Choice:** Load Telegram’s widget script per official embed; **callback** receives auth fields → **POST** to server verify endpoint → response either **`session`** (tokens) or **`pendingTicket` + suggestedName** → navigate to name screen if needed.

**CSP:** Allow Telegram script/connect origins in deployment config when strict CSP is enabled.

### 6. Rate limiting

**Choice:** Apply existing **request limiter** patterns to new auth endpoints (verify + complete-name) similar to login.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Replay** of Telegram auth payload | Enforce **max age** on `auth_date`; reject stale payloads |
| **Ticket theft** (XSS) | Short TTL; HTTPS-only; httpOnly not applicable to client-held pending token — minimize exposure via short TTL and single-use optional hardening |
| **Name squatting** | Unique index; clear **409** and UX to pick another name |
| **Email required in current schema** | Migration + placeholder or optional email — resolve before implementation (see Open Questions) |
| **Local dev / domain mismatch** for widget | Document **staging URL** or tunnel matching BotFather domain |

## Migration Plan

1. Add new fields and indexes; backfill or default **email** per decision.
2. Existing users: keep password login; add unique index on `name` only after deduplicating existing data (script or manual).
3. Deploy server with new routes, then client with widget.
4. Rollback: feature-flag or revert client widget; server endpoints can remain no-op if unused.

## Open Questions

- **`email` field:** Make optional in schema vs synthetic placeholder for Telegram-only users — pick one before coding (affects validation and “forgot password” flows).
- **Case sensitivity** for unique `name` — enforce case-insensitive uniqueness (normalized lower) vs exact match.
- **Single-use** registration tickets vs replay within TTL — optional hardening.
