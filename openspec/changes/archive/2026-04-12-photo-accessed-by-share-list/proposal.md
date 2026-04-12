## Why

Private photos are currently all-or-nothing: anyone who is not an admin cannot see them, so there is no way to share a private photo with specific authenticated accounts. The in-memory HTTP cache for `GET /photos` keys only on the URL, so responses that differ by viewer (admin vs anonymous) can collide. This change introduces an explicit share list and fixes cache partitioning so visibility rules remain correct under load.

## What Changes

- Add `accessedBy` on each photo: an array of objects `{ userId }` where `userId` is the MongoDB `_id` of a user (string in JSON API, `ObjectId` in the database).
- **Visibility (Plan B):** If `private` is false, the photo behaves as today (visible according to existing public rules). If `private` is true and `accessedBy` is empty, only admins see the photo. If `private` is true and `accessedBy` is non-empty, admins and any authenticated user whose id appears in the list see the photo; everyone else does not (list and detail).
- Extend photo upload and edit flows (admin-only mutation) so admins can maintain `accessedBy` using the same TaggedInput-style UX as other multi-value fields, backed by a small user search or listing API that returns ids for suggestions.
- Include the current user’s database id in JWT access payload (`UserInfo.userId`) and in optional auth middleware so the server can evaluate membership without a per-request user lookup solely for id resolution.
- **Cache:** Extend cache key generation (or equivalent) so cached `GET` responses for photos cannot be served to the wrong viewer segment (at minimum: anonymous vs authenticated; authenticated should vary by `userId` when private share lists exist).
- **BREAKING (API contract):** Photo documents and API responses gain `accessedBy`; clients that strict-parse unknown fields may need updates (usually backward-compatible). New optional request fields on upload/update.

## Capabilities

### New Capabilities

- `photos-access-share-list`: Photo share list storage, visibility rules for list and detail endpoints, admin-only create/update semantics aligned with product intent, and HTTP cache behavior for personalized photo reads.

### Modified Capabilities

- `shared-photos-api-types`: Shared Zod schemas and types for upload/update bodies and `ILink` (or equivalent) to include `accessedBy`.
- `shared-types-package`: `IUserInfo` / JWT payload shape to carry `userId` alongside `username` and `roles`.
- `e2e-photo-tests`: End-to-end expectations for gallery and detail when a private photo is shared with a non-admin user, and for ensuring anonymous users still cannot access those photos.

## Impact

- **Server:** Mongoose photo schema, `photos` routes (query filters, authorization on `GET` list and `GET`/:id), upload and update handlers, optional auth / verify JWT wiring, new or extended users route for picker suggestions, `middlewares/cache.ts` cache key strategy.
- **Client:** Upload and edit forms (`PhotoCommonFields`, `UploadPhoto`, `EditPhoto`), Redux or API types, user picker integration with `TaggedInput` / RHF.
- **Shared:** `shared/schemas`, `shared/types` (`ILink`, `IUserInfo`, upload types).
- **E2E:** `e2e/tests/photos.spec.ts` (or related) and any mock API fixtures for photos/users.
- **Auth flows:** Password login, refresh token re-issue, Telegram completion — all paths that mint access tokens must include `userId` when available.
