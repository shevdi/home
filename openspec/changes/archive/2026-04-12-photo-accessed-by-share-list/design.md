## Context

Photos use a Mongoose schema in `server/src/db/models/link.ts` with a boolean `private`. List and detail routes apply simple rules: non-admins never receive `private: true` in list results; detail returns 403 for private photos unless the viewer is admin. JWTs today carry only `username` and `roles` (`issueSession.ts`, `optionalAuth.ts`). Response caching uses `req.originalUrl` as the only cache key (`middlewares/cache.ts`), which is insufficient when two clients with different identities request the same URL and must receive different JSON bodies.

## Goals / Non-Goals

**Goals:**

- Persist `accessedBy` as `{ userId: ObjectId }[]` on photo documents; validate referenced users exist on write.
- Implement Plan B visibility for list and detail consistently.
- Put `userId` (Mongo `_id` as string) into access JWT `UserInfo` for all issuance paths (login, refresh, Telegram complete).
- Fix cache correctness for photos `GET` endpoints affected by viewer-specific results (key partitioning or bypass).
- Admin UI to edit `accessedBy` on upload and edit, with suggestions from server (by name prefix or similar).

**Non-Goals:**

- Self-service upload for non-admin users (product assumption: only admins mutate photos).
- Fine-grained per-photo roles beyond the allow list (e.g. read-only link tokens, expiry).
- Replacing `private` with a single enum; `private` remains the gate for “restricted” photos, with `accessedBy` refining who among authenticated users may see them when restricted.

## Decisions

1. **Storage shape:** `accessedBy: [{ userId: Schema.Types.ObjectId, ref: 'user' }]` with `{ _id: false }` on subdocuments. API JSON uses hex strings. Rationale: matches requested `{ userId }[]` and allows future fields on each entry without another migration.

2. **Visibility evaluation:** Centralize a predicate `canViewPhoto(photo, authContext)` used by list query construction and by-id handler. Rules:
   - `!photo.private` → visible to same audience as public photos today (including anonymous where applicable).
   - `photo.private && (!accessedBy || length 0)` → admin only.
   - `photo.private && accessedBy.length > 0` → admin OR (authenticated AND `auth.userId` in list). Anonymous never qualifies via list.

3. **Mongo list query:** Replace the blunt `excludeWhere('private', true)` for non-admins with an `$or` that includes: public photos (`private` false/neutral) OR (private true AND `accessedBy.userId` contains current user’s ObjectId). Admins keep a branch that sees all photos (subject to existing filters). Add index on `accessedBy.userId` if query planner needs it.

4. **JWT `userId`:** Add optional `userId: string` to `IUserInfo`; require it for tokens issued after deployment when the user document has an `_id`. `optionalAuth` / `verifyJWT` attach `userId` to `req.auth`. Rationale: O(1) membership check; avoids DB read per request for id only.

5. **User picker API:** New read-only endpoint (e.g. `GET /api/v1/users/suggestions?q=`) restricted to admin (same as editors), returning `{ id, name }[]` with `id` as `_id` string. Rationale: minimal surface; avoids exposing full user list to anonymous clients.

6. **Cache key strategy:** Append a stable viewer segment to the cache key inside `cacheMiddleware` or a photos-specific wrapper, e.g. `anon`, `admin`, `user:<userId>`. Invalidate `photos` group on mutations as today. Rationale: fixes admin/anonymous collision and supports `accessedBy` personalization. Alternative considered: disable cache for all photo GETs — rejected to preserve performance for anonymous gallery.

7. **`private` + empty `accessedBy`:** Treat missing `accessedBy` like empty array for backward compatibility with existing documents.

## Risks / Trade-offs

- **[Risk] Token size / PII:** `userId` in JWT is opaque ObjectId — low risk; still rotate secrets as today.
- **[Risk] Stale `userId` in token:** If a user is deleted, old tokens might still contain id — mitigated by membership check against live `accessedBy` on photo; optional future cleanup job to strip deleted users from lists.
- **[Risk] Cache cardinality:** Many distinct users increase cache entries — mitigated by reasonable TTL (`10 min` as today) and segment scheme.
- **[Trade-off] Non-admin in `accessedBy` without `userId` in token (old clients):** They cannot see shared photos until they refresh login — acceptable; document or bump token version implicitly by re-login.

## Migration Plan

1. Deploy schema change with `accessedBy` default undefined/empty; existing `private: true` photos remain admin-only (empty list semantics).
2. Deploy server logic + cache key change in same release to avoid wrong-cache window.
3. Deploy client + auth changes together so admins can set shares and recipients receive `userId` in new tokens.
4. Rollback: revert code; Mongo extra field is harmless; remove `userId` from JWT if rolling back auth before data cleanup (optional).

## Open Questions

- Whether the gallery “Приватные” filter UX for admins should also surface photos shared to others (likely unchanged: filter still means `private: true`).
- Exact multipart encoding for `accessedBy` on upload (JSON field vs repeated keys) — pick one convention matching existing `meta`/`tags` patterns in `uploadBodySchema`.
