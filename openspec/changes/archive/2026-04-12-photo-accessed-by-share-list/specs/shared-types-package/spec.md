## ADDED Requirements

### Requirement: IUserInfo carries optional database user id

The shared type `IUserInfo` (embedded in JWT payload types such as `DecodedJwtPayload`) SHALL include an optional string field `userId` holding the user’s MongoDB `_id` in hex form when the issuing server has resolved a user document.

#### Scenario: Access token payload includes userId after login

- **WHEN** the auth server issues an access token for a user with a database record
- **THEN** the decoded `UserInfo` object includes `userId` matching that record’s `_id` string

#### Scenario: Backward compatibility for types

- **WHEN** older tokens without `userId` are decoded in transitional code paths
- **THEN** TypeScript still allows `userId` to be absent and consumers treat absence as unknown id for share checks
