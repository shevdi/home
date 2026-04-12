## ADDED Requirements

### Requirement: Photo documents store accessedBy as user id entries

Each photo document SHALL include an optional field `accessedBy` consisting of an array of subdocuments. Each subdocument SHALL contain exactly one field `userId` referencing the user’s MongoDB `_id`. An omitted field or empty array SHALL be treated as no explicit grantees.

#### Scenario: Persisted shape matches contract

- **WHEN** an admin saves a photo with two granted users
- **THEN** the stored document contains `accessedBy` with two entries each having `userId` equal to those users’ ObjectIds

### Requirement: Plan B visibility for private photos on list

For `GET` photo list responses, the server SHALL include a photo when `private` is false according to existing public visibility rules. When `private` is true, the server SHALL include the photo only if the request viewer is an admin OR (`accessedBy` is non-empty AND the viewer is authenticated AND the viewer’s `userId` matches one of the `accessedBy.userId` values). When `private` is true and `accessedBy` is empty or absent, only admins SHALL see the photo in list results.

#### Scenario: Anonymous user never sees private photos in list

- **WHEN** an unauthenticated client requests the photo list
- **THEN** no photo with `private: true` appears in the results

#### Scenario: Authenticated non-admin sees only shared private photos

- **WHEN** a non-admin user with `userId` A requests the list and a private photo has `accessedBy` containing A
- **THEN** that photo appears in the results

#### Scenario: Authenticated non-admin does not see unshared private photos

- **WHEN** a non-admin user requests the list and a private photo has an empty or absent `accessedBy`
- **THEN** that photo does not appear in the results

### Requirement: Plan B visibility for private photos on detail

For `GET` photo by id, the server SHALL return the photo payload when `private` is false according to existing rules. When `private` is true, the server SHALL return the photo only for admins OR for authenticated users whose `userId` is listed in `accessedBy`. Otherwise the server SHALL respond with forbidden or not-found semantics consistent with the existing client contract for inaccessible private photos.

#### Scenario: Granted user opens detail

- **WHEN** an authenticated non-admin whose `userId` is in `accessedBy` requests `GET /photos/:id` for that private photo
- **THEN** the response succeeds with photo fields needed for display

#### Scenario: Non-grantee cannot open detail

- **WHEN** an authenticated non-admin whose `userId` is not in `accessedBy` requests `GET /photos/:id` for that private photo
- **THEN** the server denies access in the same class of response used for other inaccessible private photos

### Requirement: Only admins may create or update photo share metadata

Photo upload and photo update endpoints that set `private`, `accessedBy`, or other photo metadata SHALL require an authenticated admin. Non-admin callers SHALL not change `accessedBy` through these endpoints.

#### Scenario: Non-admin update rejected

- **WHEN** a non-admin user calls the photo update API
- **THEN** the server responds with an authorization error and does not modify the photo

### Requirement: Admin-only user suggestions for share picker

The server SHALL expose a read-only HTTP API that returns candidate users for populating `accessedBy`, suitable for TaggedInput suggestions. That API SHALL be callable only by admins.

#### Scenario: Anonymous cannot list suggestions

- **WHEN** an unauthenticated client calls the suggestions API
- **THEN** the server responds with unauthorized or forbidden

### Requirement: Photo GET response cache varies by viewer segment

In-memory caching for `GET` routes that return viewer-dependent photo JSON SHALL incorporate the viewer segment into the cache key so that distinct viewers do not receive one another’s cached bodies for the same URL. At minimum, responses for anonymous users, admin users, and each distinct authenticated non-admin `userId` SHALL not collide.

#### Scenario: Admin and anonymous do not share one cache entry

- **WHEN** an anonymous client and an admin client request the same photos list URL within the cache TTL
- **THEN** each receives a body consistent with their respective visibility rules
