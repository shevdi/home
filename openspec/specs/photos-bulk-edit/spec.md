# photos-bulk-edit Specification

## Purpose

Defines client behavior for bulk metadata editing of existing gallery photos at **`/photos/edit`**, including routing, gallery handoff, shared bulk-option state with upload, and safe handling when navigation state is missing.

## Requirements

### Requirement: Bulk edit route exists and is not confused with photo id

The application SHALL expose a dedicated route **`/photos/edit`** for bulk metadata editing of existing photos. The router SHALL resolve this path as the bulk-edit page and SHALL NOT treat the segment **`edit`** as a photo identifier.

#### Scenario: User opens bulk edit URL

- **WHEN** an authenticated admin navigates to **`/photos/edit`** with valid navigation state
- **THEN** the bulk-edit page is shown (not the single-photo detail view)

#### Scenario: Static segment takes precedence

- **WHEN** the routing configuration is loaded
- **THEN** the literal **`edit`** route is registered so that it does not fall through to **`/photos/:id`**

### Requirement: Gallery initiates bulk edit with loaded photos

For users with permission to manage photos, the gallery SHALL provide a control that navigates to **`/photos/edit`**. The navigation SHALL include the set of photos that were loaded in the gallery list for the current filters/search at the time of navigation (the same items the user would see in the grid, including the client-side private filter behavior used by the gallery).

#### Scenario: Admin opens bulk edit from gallery

- **WHEN** an admin clicks the bulk-edit control from the photos gallery
- **THEN** the application navigates to **`/photos/edit`** and the bulk-edit list contains those gallery-loaded photos

#### Scenario: Non-admin does not see bulk edit entry

- **WHEN** a user without admin photo permissions views the gallery
- **THEN** the bulk-edit entry control is not shown

### Requirement: Bulk edit page matches upload bulk semantics

On **`/photos/edit`**, the page SHALL present a scrollable list of the handed-off photos with per-row selection and a bulk metadata panel equivalent to upload-time per-file fields (title, priority, private, country/city tags, tags, accessed-by). The panel SHALL support applying changes to the selected subset or to all listed photos when none are selected, consistent with existing bulk merge behavior.

#### Scenario: User edits metadata for multiple photos

- **WHEN** the user selects one or more rows and commits bulk field changes
- **THEN** each targeted row’s **`PerFileOptions`** (or equivalent) is updated accordingly

#### Scenario: User saves changes

- **WHEN** the user submits the form to persist changes
- **THEN** the application updates each photo on the server using the existing per-photo update mechanism (PUT per photo) for every listed photo with pending changes (exact granularity defined in implementation)

### Requirement: Shared bulk state logic

The implementation SHALL reuse a single abstraction (hook or module) for **`PerFileOptions`** map management, row selection, merged bulk view, and bulk field handlers across **`UploadPhoto`** and the **`/photos/edit`** flow, so that behavior changes need not be duplicated in two large components.

#### Scenario: Upload still uses dropzone

- **WHEN** an admin uses the upload photo page
- **THEN** file drop / pick remains available and the bulk panel still functions as today

### Requirement: Missing handoff is handled safely

If **`/photos/edit`** is opened without usable navigation state (e.g. refresh or bookmark), the page SHALL not crash and SHALL inform the user how to return to the gallery to start again.

#### Scenario: Direct load without state

- **WHEN** the user loads **`/photos/edit`** without photo handoff data
- **THEN** the page shows an empty-state message and a path back to **`/photos`**
