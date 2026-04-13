## 1. Shared types and JWT

- [x] 1.1 Add optional `userId` to `IUserInfo` in `@shevdi-home/shared` and export through the same entrypoints as today.
- [x] 1.2 Extend `issueSessionForUser` to accept `userId` (string) and embed it in access token `UserInfo`.
- [x] 1.3 Pass `userId` from user documents in password login, refresh token re-issue, and Telegram completion flows.
- [x] 1.4 Attach `userId` from decoded JWT in `optionalAuth` and `verifyJWT` onto `req.auth`.

## 2. Data model and validation

- [x] 2.1 Add `accessedBy: [{ userId: ObjectId }]` to the photo Mongoose schema with backward-compatible defaults.
- [x] 2.2 Extend shared Zod schemas (`uploadBodySchema`, update body) and `ILink` with optional `accessedBy` as `{ userId: string }[]`.
- [x] 2.3 On photo create/update, validate each `userId` exists in `User` collection and reject otherwise.

## 3. Visibility and queries

- [x] 3.1 Implement `canViewPhoto`-style logic for `GET /photos/:id` per `photos-access-share-list` spec.
- [x] 3.2 Replace non-admin list filter with Mongo query that includes public photos OR private photos where `accessedBy.userId` contains the current user’s id; keep admin path seeing all.
- [x] 3.3 Ensure anonymous list and detail never expose private photos regardless of `accessedBy`.

## 4. APIs and admin UX

- [x] 4.1 Add admin-only `GET` (or equivalent) user suggestions endpoint returning `{ id, name }` for TaggedInput.
- [x] 4.2 Wire upload and update handlers to persist `accessedBy` from validated body.
- [x] 4.3 Add `RhfTaggedInput` (or equivalent) to upload and edit forms for `accessedBy`, wired to suggestions and storing user ids.
- [x] 4.4 Enforce admin-only access on upload, update, and delete routes if any gap exists.

## 5. Caching

- [x] 5.1 Extend photo `GET` cache keying to include viewer segment (`anon`, `admin`, `user:<userId>`) per design.
- [x] 5.2 Verify `cacheClear('photos')` still invalidates all segments or document any cache-bypass exceptions.

## 6. Tests and verification

- [x] 6.1 Add or extend server tests for list/detail visibility matrix (admin, grantee, stranger, anonymous).
- [x] 6.2 Add e2e coverage per `e2e-photo-tests` delta (grantee sees shared private; anonymous denied; unshared private hidden from non-admin).
- [x] 6.3 Add a regression test that two viewers hitting the same list URL receive different bodies when rules differ (cache + visibility).
