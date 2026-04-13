# typed-env-config Specification Delta

## ADDED Requirements

### Requirement: Telegram bot token is available for Login Widget verification

The server configuration SHALL include the Telegram bot token used to verify Login Widget authorization data. Telegram auth code SHALL read this value from the typed config module, not raw `process.env`.

#### Scenario: Server starts with Telegram env when Telegram auth is required

- **WHEN** the server starts and Telegram login is enabled for the deployment
- **THEN** the bot token is present in validated config and the Telegram verification path can run

#### Scenario: Config documents new Telegram-related secrets

- **WHEN** developers configure the application for Telegram login
- **THEN** documentation or schema (e.g. zod) SHALL list required variables including the bot token and any separate secret used to sign pending-registration tickets
