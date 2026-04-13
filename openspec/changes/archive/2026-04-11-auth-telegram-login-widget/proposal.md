## Why

Users should be able to sign in with Telegram alongside password login. The Telegram Login Widget provides a low-friction path for users who already use Telegram, without replacing the existing username/password flow.

## What Changes

- Add **Telegram Login Widget** on the client login surface; handle the widget callback and coordinate with the server.
- Add **server-side verification** of Telegram authorization data (HMAC per Telegram docs) before trusting any identity.
- Adopt **Way A registration**: issue normal JWT + refresh **only** after a valid, **unique** `name` exists. If Telegram does not provide a default `@username`, require the user to choose a name in a dedicated step **before** full session issuance; use a **short-lived registration ticket** (or equivalent) between Telegram success and name completion.
- Extend the **user model**: optional `password`; **unique** `name`; store **Telegram user id** (and optional username snapshot) for one app user ↔ one Telegram identity; new Telegram sign-ups get **`role: user`**.
- Add **environment configuration** for the Telegram bot token (validated with existing typed env patterns).
- Update **mock server / e2e** as needed so CI remains green.

## Capabilities

### New Capabilities

- `auth-telegram-login`: Telegram Login Widget integration, server verification of widget payloads, Way A pending-name flow with registration ticket, user schema rules (optional password, unique name, telegram id linkage, default name from `@username` when present), and client UX for widget + name step.

### Modified Capabilities

- `typed-env-config`: Document and validate new server env for Telegram (e.g. bot token required when Telegram auth is enabled, or required unconditionally if the feature is always on—see design).

## Impact

- **Server**: New auth routes or extensions, Telegram hash verification utility, user CRUD adjustments, migration for existing users (password optional, unique index on `name`, new fields).
- **Client**: Login page (or auth feature) loads widget script, handles callback, new UI route or modal for required name when no default, RTK Query endpoints for Telegram verify + complete-name.
- **Config / ops**: BotFather domain configuration for the widget; CSP may need Telegram script/connect origins.
- **Dependencies**: No new heavy OAuth stacks; relies on official widget script + crypto on server.
