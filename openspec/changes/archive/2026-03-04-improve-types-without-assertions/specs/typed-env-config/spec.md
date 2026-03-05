# Typed Env Config

## ADDED Requirements

### Requirement: Server loads env from validated config

The server SHALL load environment variables via a zod-validated config module. Required variables SHALL be validated at startup. The server SHALL fail fast (exit with error) if any required variable is missing or invalid.

#### Scenario: Server starts with valid env

- **WHEN** the server starts and all required env vars (e.g. ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET) are set and valid
- **THEN** the config module exports a typed `env` object and the server proceeds

#### Scenario: Server fails when required env is missing

- **WHEN** the server starts and ACCESS_TOKEN_SECRET is missing or empty
- **THEN** the config validation throws and the server exits with an error before handling requests

#### Scenario: Auth and services use config instead of process.env

- **WHEN** optionalAuth, verifyJWT, auth service, or drime service need env values
- **THEN** they import from the config module rather than using `process.env.X as string`
