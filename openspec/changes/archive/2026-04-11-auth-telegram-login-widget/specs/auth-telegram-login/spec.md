# auth-telegram-login Specification Delta

## ADDED Requirements

### Requirement: Server verifies Telegram Login Widget authorization data

The server SHALL verify Telegram widget payloads using Telegram’s documented algorithm before creating sessions or pending-registration tickets. The server SHALL reject payloads that fail verification or are outside an acceptable `auth_date` window.

#### Scenario: Valid payload is accepted for processing

- **WHEN** the client sends Telegram authorization fields including `hash` and `auth_date` from the widget callback
- **THEN** the server recomputes the secret key from the bot token, validates `hash` over the data-check string, and checks `auth_date` is within the configured maximum age

#### Scenario: Invalid or stale payload is rejected

- **WHEN** the hash does not match or `auth_date` is too old
- **THEN** the server responds with an error and SHALL NOT issue a session or pending-registration ticket

### Requirement: Full session is issued only after a unique name exists (Way A)

The system SHALL NOT issue the normal access token and refresh-token cookie used for standard API authentication until the user record has a **unique** `name` satisfying persistence rules. If Telegram does not supply a usable default name, the user MUST complete a name step first.

#### Scenario: Telegram username present — suggested name without session

- **WHEN** verification succeeds and Telegram provides a username usable as the default display name
- **THEN** the server returns a pending-registration ticket and a suggested `name` derived from that username for the client to pre-fill, and SHALL NOT issue a full session until the user submits a `name` that passes uniqueness validation

#### Scenario: No Telegram username — name is required before session

- **WHEN** verification succeeds and there is no default `@username` for pre-fill
- **THEN** the server SHALL NOT issue a full session until the client submits a required `name` with the pending-registration ticket

#### Scenario: Duplicate name rejected

- **WHEN** the client completes the name step with a `name` that collides with an existing user
- **THEN** the server rejects the request with a conflict response and SHALL NOT issue a session

### Requirement: Pending-registration ticket

The server SHALL issue a short-lived, signed pending-registration ticket after successful Telegram verification when a full session cannot be issued yet. The ticket SHALL be redeemable only for completing registration (setting `name`) and SHALL expire within a configured maximum time.

#### Scenario: Expired ticket is rejected

- **WHEN** the client submits a pending-registration ticket past its expiry
- **THEN** the server rejects the request and SHALL NOT create or update a user session

### Requirement: Telegram identity maps to one app user

The system SHALL store Telegram’s numeric user id on the user record and SHALL enforce at most one app user per Telegram user id.

#### Scenario: Returning Telegram user signs in

- **WHEN** verification succeeds for a Telegram user id already linked to an existing user with a complete `name`
- **THEN** the server issues a full session without requiring the name step again

### Requirement: New Telegram sign-ups receive role user

- **WHEN** a new user is created via Telegram login completion
- **THEN** the assigned roles SHALL include `user` as for other standard end-users

### Requirement: Password is optional for Telegram-only users

- **WHEN** a user is created or used only via Telegram and has not set a password
- **THEN** the user record SHALL allow absent password and password-based login SHALL remain unavailable until a password is set by a defined flow (if any)

#### Scenario: Password login unchanged for users with password

- **WHEN** a user has a password set
- **THEN** existing username and password login behavior continues to apply

### Requirement: Client surfaces Telegram Login Widget

The client SHALL embed the Telegram Login Widget on the login experience and SHALL send authorization data to the server for verification. The client SHALL implement the name step when the server requires it before showing an authenticated shell.

#### Scenario: Name required flow

- **WHEN** the server responds that a name is required or provides only a pending ticket
- **THEN** the client presents a name entry step and does not treat the user as logged in for protected content until tokens are issued

### Requirement: Auth endpoints for Telegram are rate-limited

- **WHEN** clients call Telegram verification or name-completion endpoints
- **THEN** those endpoints SHALL be protected by request rate limiting consistent with existing login throttling goals
