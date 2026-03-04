## ADDED Requirements

### Requirement: Unauthenticated user sees only public photos in gallery
The gallery page (`/photos`) SHALL display public photos and SHALL NOT display private photos when the user is not authenticated.

#### Scenario: Public photos are visible
- **WHEN** an unauthenticated user navigates to `/photos`
- **THEN** photos with `private: false` appear in the gallery as image links

#### Scenario: Private photos are hidden
- **WHEN** an unauthenticated user navigates to `/photos`
- **THEN** no element with `aria-label="Private photo"` (private badge) is visible in the gallery

### Requirement: Unauthenticated user can navigate to a photo detail page
The gallery SHALL contain clickable photo links. Clicking a photo SHALL navigate to `/photos/:id` and display the photo detail view.

#### Scenario: Click photo navigates to detail
- **WHEN** an unauthenticated user is on `/photos` and clicks a photo link
- **THEN** the URL changes to `/photos/:id` and the photo image is displayed

#### Scenario: Prev/next navigation links are shown
- **WHEN** a user views a photo that has neighbours in the current gallery ordering
- **THEN** "Предыдущее" and/or "Следующее" navigation links are visible and lead to adjacent photos

### Requirement: Unauthenticated user cannot access upload page
Navigating to `/photos/new` without authentication SHALL show the "Такого фото нет" not-found message instead of the upload form.

#### Scenario: Direct navigation to upload page
- **WHEN** an unauthenticated user navigates to `/photos/new`
- **THEN** the text "Такого фото нет" is visible and no upload form is displayed

### Requirement: Unauthenticated user cannot view private photo by direct link
Navigating directly to `/photos/:id` for a private photo without authentication SHALL show the "Такого фото нет" not-found view or return a 403-level access denial.

#### Scenario: Direct link to private photo
- **WHEN** an unauthenticated user navigates to `/photos/:id` where the photo is private
- **THEN** the text "Такого фото нет" is visible

### Requirement: Authenticated user sees private photos in gallery
When logged in as admin and the "Приватные" filter is enabled, private photos SHALL appear in the gallery with a private badge.

#### Scenario: Private filter shows private photos
- **WHEN** an admin user is on `/photos` and checks the "Приватные" checkbox
- **THEN** private photos appear in the gallery with an element bearing `aria-label="Private photo"`

### Requirement: Authenticated user can view private photo detail
An admin user SHALL be able to navigate to `/photos/:id` for a private photo and see it rendered normally, with an "Редактировать" edit link visible.

#### Scenario: Admin opens private photo
- **WHEN** an admin navigates to `/photos/:id` for a private photo
- **THEN** the photo image is displayed and a "Редактировать" link is visible

### Requirement: Authenticated user can edit a photo
The edit page (`/photos/:id/edit`) SHALL display a form with title, priority, private checkbox, country, city, and tags fields. Submitting the form SHALL persist changes.

#### Scenario: Edit photo fields and save
- **WHEN** an admin navigates to `/photos/:id/edit`, changes the title, and clicks "Сохранить"
- **THEN** the form submits successfully (no error message appears)

### Requirement: Authenticated user can delete a photo
The edit page SHALL contain a "Удалить" button. Clicking it SHALL delete the photo and redirect to `/photos`.

#### Scenario: Delete photo redirects to gallery
- **WHEN** an admin is on `/photos/:id/edit` and clicks "Удалить"
- **THEN** the browser navigates to `/photos` and the deleted photo is no longer in the gallery

### Requirement: Gallery search filters photos by tag
Entering a tag in the "Теги" input and pressing Enter SHALL filter the gallery to show only photos matching that tag.

#### Scenario: Filter by existing tag
- **WHEN** a user types "вьетнам" in the tags input and presses Enter
- **THEN** the gallery updates to show only photos tagged "вьетнам"

#### Scenario: Filter by non-existent tag shows empty gallery
- **WHEN** a user types a tag that no photo has and presses Enter
- **THEN** the gallery shows no photo cards

### Requirement: Gallery search filters photos by country and city
Entering a value in the "Страна" or "Город" input and pressing Enter SHALL filter the gallery by location.

#### Scenario: Filter by country
- **WHEN** a user types a country name in the "Страна" input and presses Enter
- **THEN** the gallery updates to show only photos from that country

### Requirement: Full-size link opens original image
The photo detail page SHALL display a "Полный размер" link that opens the full-size image URL in a new tab.

#### Scenario: Full-size link present on photo detail
- **WHEN** a user views a photo at `/photos/:id`
- **THEN** a link with text "Полный размер" is visible and its `href` points to the photo's `fullSizeUrl`

### Requirement: Photo detail shows metadata when available
The photo detail page SHALL display the taken date (as a clickable link to date-filtered gallery) and tags when the photo has them.

#### Scenario: Date and tags shown for photo with metadata
- **WHEN** a user views a photo that has `meta.takenAt` and `tags`
- **THEN** the formatted date is visible as a link and the tags are displayed

#### Scenario: No metadata section for photo without metadata
- **WHEN** a user views a photo that has no `meta.takenAt` and no `tags`
- **THEN** no date link or tag list is shown on the detail page
