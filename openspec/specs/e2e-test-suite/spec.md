## MODIFIED Requirements

### Requirement: Photo flows are covered by E2E tests

The system SHALL have E2E tests for viewing the photo gallery, filtering/searching, single photo detail with navigation, and (when authenticated) for edit and delete flows. Unauthenticated users SHALL be able to view public photos but SHALL be denied access to private photos and the upload page. Authenticated (admin) users SHALL be able to access private photos, edit pages, and delete photos. Tests SHALL use seeded data via `/__test/seed-photos` and clean up via `/__test/reset-photos`.

#### Scenario: View photo gallery

- **WHEN** user navigates to `/photos`
- **THEN** the photo gallery is displayed with public photo cards

#### Scenario: View single photo

- **WHEN** user navigates to `/photos/:id` for an existing public photo
- **THEN** the photo detail view is displayed with image, navigation links, and "Полный размер" link

#### Scenario: Authenticated user can access edit page

- **WHEN** an authenticated admin user navigates to `/photos/:id/edit`
- **THEN** the edit photo form is displayed with title, priority, private, country, city, and tags fields

#### Scenario: Unauthenticated user cannot access upload page

- **WHEN** an unauthenticated user navigates to `/photos/new`
- **THEN** the user sees "Такого фото нет" instead of the upload form

#### Scenario: Unauthenticated user cannot view private photo

- **WHEN** an unauthenticated user navigates to `/photos/:id` for a private photo
- **THEN** the user sees "Такого фото нет"

#### Scenario: Gallery filters by tags

- **WHEN** user enters a tag in the search filter
- **THEN** the gallery updates to show only matching photos

#### Scenario: Admin can delete a photo

- **WHEN** an admin clicks "Удалить" on the edit page
- **THEN** the photo is deleted and the user is redirected to the gallery
