# upload-per-file-options Specification

## Purpose
TBD - created by archiving change bulk-edit-upload. Update Purpose after archive.
## Requirements
### Requirement: Per-file metadata state
The Upload page SHALL maintain a `Map<fileId, PerFileOptions>` where `PerFileOptions` contains `title` (string), `priority` (number), `country` (string[]), `city` (string[]), `tags` (string[]). Each file dropped into the upload zone SHALL receive a default entry with empty title, priority 0, and empty arrays.

#### Scenario: Files dropped into upload zone
- **WHEN** user drops 3 image files into the upload dropzone
- **THEN** the fileOptions Map contains 3 entries keyed by fileId, each with default values (title: "", priority: 0, country: [], city: [], tags: [])

#### Scenario: File removed from upload
- **WHEN** user removes a file from the upload list
- **THEN** the corresponding entry is removed from fileOptions Map and from the selection Set

### Requirement: File selection by click
The Upload page SHALL allow selecting/deselecting individual files by clicking on the file row. Selected files SHALL be visually distinguished (highlight or border). A "select all" checkbox at the top of the file list SHALL toggle between selecting all files and selecting none.

#### Scenario: Click to select a file
- **WHEN** user clicks on a file row that is not selected
- **THEN** the file is added to the selection Set and the row is visually highlighted

#### Scenario: Click to deselect a file
- **WHEN** user clicks on a file row that is already selected
- **THEN** the file is removed from the selection Set and the highlight is removed

#### Scenario: Select all toggle — select
- **WHEN** user clicks the "select all" checkbox and not all files are selected
- **THEN** all file IDs are added to the selection Set

#### Scenario: Select all toggle — deselect
- **WHEN** user clicks the "select all" checkbox and all files are already selected
- **THEN** the selection Set is cleared (no files selected)

### Requirement: Compact per-file metadata summary
Each file row in the upload list SHALL display a compact summary of its current per-file options (country, city, tags, title, priority) alongside the existing EXIF metadata. Only non-empty fields SHALL be shown.

#### Scenario: File with metadata displays summary
- **WHEN** a file has country: ["France"], tags: ["travel", "city"], priority: 5
- **THEN** the file row shows a compact line like "France · travel, city · приоритет: 5"

#### Scenario: File with default metadata
- **WHEN** a file has all default values (empty title, priority 0, empty arrays)
- **THEN** no additional metadata summary line is shown (only EXIF meta remains)

### Requirement: Bulk edit form with merged view
The Upload page SHALL display a bulk edit form that shows merged values computed from the current targets (selected files, or all files if none selected). For scalar fields (title, priority), if all targets share the same value the form SHALL show that value; if values differ the form SHALL show placeholder text "(разные значения)". For tag array fields (country, city, tags), the form SHALL show the intersection of values across all targets.

#### Scenario: All selected files share the same title
- **WHEN** 3 files are selected and all have title "sunset"
- **THEN** the title input shows "sunset"

#### Scenario: Selected files have different priorities
- **WHEN** 2 files are selected with priority 5 and priority 3
- **THEN** the priority input is empty with placeholder "(разные значения)"

#### Scenario: Tag intersection across selection
- **WHEN** file A has tags ["travel", "city"] and file B has tags ["travel", "food"]
- **THEN** the tags field shows ["travel"] (the intersection)

#### Scenario: No files selected — targets all files
- **WHEN** 0 files are selected and there are 5 files in the list
- **THEN** the bulk edit form computes merged values from all 5 files

### Requirement: Enter-commit for simple inputs
Title and priority inputs in the bulk edit form SHALL commit their value to all target files only when the user presses Enter. Keystroke changes SHALL NOT immediately update per-file state.

#### Scenario: User types title and presses Enter with selection
- **WHEN** user types "beach day" in the title field and presses Enter, with files A and B selected
- **THEN** fileOptions[A].title and fileOptions[B].title are set to "beach day"

#### Scenario: User types title and presses Enter with no selection
- **WHEN** user types "beach day" in the title field and presses Enter, with no files selected
- **THEN** all entries in fileOptions have their title set to "beach day"

#### Scenario: User types without pressing Enter
- **WHEN** user types in the title field without pressing Enter
- **THEN** no fileOptions entries are modified

### Requirement: Tag add/remove applies to targets
When a tag is added or removed in the bulk edit form's tag fields (country, city, tags), the change SHALL immediately apply to all target files (selected, or all if none selected). Adding a tag SHALL append it to each target file's array (if not already present). Removing a tag SHALL remove it from each target file's array.

#### Scenario: Add tag to selected files
- **WHEN** user adds tag "beach" in the tags field, with files A and B selected
- **THEN** "beach" is appended to fileOptions[A].tags and fileOptions[B].tags (if not already present)

#### Scenario: Remove tag from selected files
- **WHEN** merged view shows intersection tag "travel" and user removes it, with files A and B selected
- **THEN** "travel" is removed from fileOptions[A].tags and fileOptions[B].tags

### Requirement: Global fields remain batch-wide
The `private` checkbox and `accessedBy` user picker SHALL remain batch-wide — they apply to all files in the upload uniformly, not per-file. These fields SHALL NOT be part of the per-file options.

#### Scenario: Private toggle applies to entire batch
- **WHEN** user checks the "Скрыть" checkbox
- **THEN** the private flag applies to all files in the upload batch regardless of selection

