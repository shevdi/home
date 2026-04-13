# ui-kit-tagged-input-autocomplete Specification

## Purpose

Define requirements for optional async autocomplete on `TaggedInput` in `@shevdi-home/ui-kit`, including suggestion display, keyboard behavior, Storybook coverage, and compatibility with the client `RhfTaggedInput` wrapper.

## Requirements

### Requirement: Optional async autocomplete for TaggedInput

The `@shevdi-home/ui-kit` package SHALL extend `TaggedInput` with an optional autocomplete mode. When autocomplete is enabled, the component SHALL request suggestions based on the current draft input and SHALL display those suggestions in a dropdown-like panel. Each suggestion SHALL include a stable string `value` used when the user commits a choice to the tag list, and a `label` suitable for display in the list (string or structured content). The component SHALL NOT import application-specific modules, HTTP clients, or routing libraries for this feature.

#### Scenario: Parent supplies async suggestions

- **WHEN** autocomplete is enabled and the user types in the draft field
- **THEN** the component SHALL invoke the documented callback to obtain suggestions and SHALL render the returned items in a dropdown panel

#### Scenario: Domain stays outside ui-kit

- **WHEN** a consumer inspects ui-kit sources for `TaggedInput` autocomplete
- **THEN** the implementation SHALL NOT statically import project-specific user APIs, photo feature code, or `react-router` / `react-router-dom`

### Requirement: Choosing a suggestion commits value

When autocomplete is active, the user SHALL be able to select a suggestion such that the corresponding `value` is appended to the tag list according to the existing insert/dedupe rules, the draft input is cleared, and the suggestion panel closes.

#### Scenario: Keyboard selection

- **WHEN** the suggestion list is open, an item is highlighted, and the user presses Enter
- **THEN** that item’s `value` SHALL be committed as a new tag (or rejected as duplicate per existing rules), the draft SHALL clear, and the list SHALL close

#### Scenario: Pointer selection

- **WHEN** the user clicks a suggestion row
- **THEN** the same outcome as keyboard selection for that row SHALL occur

### Requirement: Keyboard and dismissal behavior

The autocomplete interaction SHALL support keyboard navigation within the suggestion list (at minimum: move highlight up/down, Escape to close without committing a suggestion when appropriate). When the suggestion list is closed or no item is highlighted, Enter SHALL preserve existing `TaggedInput` commit behavior for free text. The component SHALL document the exact key map for Storybook and consumers.

#### Scenario: Escape closes list

- **WHEN** the suggestion list is open and the user presses Escape
- **THEN** the list SHALL close without adding a tag from the highlighted item

### Requirement: Storybook coverage for autocomplete

The ui-kit package SHALL include at least one Storybook story demonstrating `TaggedInput` with autocomplete enabled, using mock asynchronous suggestions (no real network). The story SHALL illustrate a representative label format so application teams can mirror display conventions.

#### Scenario: Story exists for autocomplete

- **WHEN** a developer opens Storybook for `TaggedInput`
- **THEN** they SHALL find a story that shows autocomplete with mock delayed suggestions

### Requirement: React Hook Form wrapper compatibility

The client `RhfTaggedInput` wrapper SHALL forward optional autocomplete-related props to `TaggedInput` so form call sites can enable autocomplete without bypassing the wrapper.

#### Scenario: Props reach TaggedInput

- **WHEN** a consumer passes autocomplete props to `RhfTaggedInput`
- **THEN** those props SHALL be applied to the underlying `TaggedInput` instance
