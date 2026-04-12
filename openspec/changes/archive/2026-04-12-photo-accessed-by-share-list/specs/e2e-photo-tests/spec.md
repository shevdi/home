## ADDED Requirements

### Requirement: Non-admin granted access sees shared private photo in gallery

When a private photo includes the signed-in non-admin user’s `userId` in `accessedBy`, the gallery at `/photos` SHALL list that photo without requiring the “Приватные” admin-only filter semantics to apply to that user.

#### Scenario: Shared private appears for grantee

- **WHEN** a private photo exists with `accessedBy` containing the current non-admin user’s id and the user opens `/photos`
- **THEN** a link or card for that photo is visible in the gallery

### Requirement: Non-admin without grant does not see unshared private photo in gallery

When a private photo has an empty or absent `accessedBy`, a signed-in non-admin user SHALL NOT see that photo in the default gallery listing.

#### Scenario: Unshared private hidden from non-admin

- **WHEN** a private photo has no grantees and a non-admin user opens `/photos`
- **THEN** that photo does not appear among visible gallery items

### Requirement: Non-admin grantee opens private photo detail

A non-admin user who appears in `accessedBy` for a private photo SHALL be able to open `/photos/:id` for that photo and see the image (not the “Такого фото нет” denial used for inaccessible photos).

#### Scenario: Grantee detail view

- **WHEN** a non-admin grantee navigates to `/photos/:id` for a private shared photo
- **THEN** the photo image is displayed

### Requirement: Anonymous user still cannot access shared private photo

Unauthenticated users SHALL NOT see private photos in the gallery or by direct detail link, even when `accessedBy` is non-empty.

#### Scenario: Anonymous gallery excludes shared private

- **WHEN** an unauthenticated user opens `/photos` and a private photo with non-empty `accessedBy` exists
- **THEN** that photo is not shown

#### Scenario: Anonymous detail denied for shared private

- **WHEN** an unauthenticated user navigates directly to `/photos/:id` for that photo
- **THEN** the UI shows the same class of denial as for other private photos (e.g. “Такого фото нет” or equivalent)
