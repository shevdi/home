## Context

The client already implements multi-file upload with per-file metadata and a shared **`BulkEditForm`** driven by **`PerFileOptions`** and selection (`UploadPhoto.tsx`). The gallery loads photos via infinite query (`PhotoGallery.tsx`). Single-photo edit uses **`/photos/:id/edit`** and **`changePhoto`** (PUT). There is no bulk edit path for existing gallery items today.

## Goals / Non-Goals

**Goals:**

- Ship **`/photos/edit`** for admins with the same bulk field UX as upload (list, multi-select, merged bulk panel).
- Populate the edit list from photos the user had loaded in the gallery for the current search/filter when they choose “bulk edit”.
- Share implementation between upload and bulk-edit to avoid a second copy of selection/bulk logic.
- Keep static route **`/photos/edit`** disambiguated from **`/photos/:id`**.

**Non-Goals:**

- New server batch-update endpoint (reuse per-photo PUT).
- Editing photos not surfaced through this handoff (no global “all DB photos” picker in this change).
- Changing single-photo **`/photos/:id/edit`** behavior beyond what is needed for routing coexistence.

## Decisions

1. **Route registration**  
   Declare **`path="edit"`** as a sibling **before** **`path=":id"`** under **`photos`** so **`/photos/edit`** is not interpreted as **`id = "edit"`**.

2. **Handoff from gallery → edit page**  
   Use **`navigate('/photos/edit', { state: { … } })`** carrying the **array of photo records** (or a minimal DTO) currently shown by the gallery infinite result after client-side private filter, at navigation time.  
   - **Rationale**: Matches “photos already loaded”; no extra fetch; works with existing grid data shape.  
   - **Alternative considered**: IDs only + read RTK Query cache — tighter coupling to cache keys and timing; rejected for first version.

3. **Direct entry / refresh**  
   If **`location.state`** is missing or empty, render an explicit empty state (copy + link **`/photos`**) rather than silently erroring.

4. **Code structure**  
   Extract a **hook** (e.g. **`useBulkPerFileOptions`**) encapsulating **`Map<id, PerFileOptions>`**, **`Set` selection**, **`computeMergedView`**, and scalar/tag bulk handlers already mirrored in **`UploadPhoto`**. **`UploadPhoto`** keeps dropzone, **`react-hook-form`** for **`File[]`**, **`buildMeta`**, and **`uploadPhotosThunk`**. A new **`EditPhotos`** (feature) component consumes the hook, maps rows to server photos, hydrates options from each photo, and submits via **`changePhoto`** per row (sequential or limited concurrency—implementation detail in tasks).

5. **Row UI**  
   Prefer a **dedicated row component** for existing photos (thumbnail + title link + remove-from-session) over overloading **`FileData`** with many optional props, unless the overlap is large enough to justify a shared primitive.

6. **Authorization**  
   Match upload: **admin-only** page and gallery entry control (same as “Добавить фото”).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large `location.state` for many photos | Cap is implicit (only “loaded” pages); document; optional follow-up to pass IDs + refetch |
| Partial failures on N PUTs | Surface per-row error state; allow retry of failed rows |
| Stale data if user stays on edit page long | Non-goal for v1; single navigation snapshot |

## Migration Plan

Client-only rollout: deploy routes + UI; no DB migration. Rollback: remove route and gallery link.

## Open Questions

- Whether to run PUTs strictly sequential vs small **`Promise`** pool for UX (tasks can pick a default).
- Exact Russian labels for the new gallery control and page title (align with existing copy style).
