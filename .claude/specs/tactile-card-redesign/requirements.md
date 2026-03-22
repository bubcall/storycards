# Requirements Document: Tactile Card UX Redesign

## Introduction

This feature represents a major UX redesign of the Storycards application to transform it from a dashboard-style interface into a **digital desk for writing and moving physical index cards**. The core experience shifts from forms and panels to the tactile actions of writing, flipping, placing, and rearranging story cards.

The redesign centers on the metaphor: **a clean open desk covered in story index cards**.

---

## Requirements

### 1. Workspace Layout Redesign

**User Story:** As a writer, I want an open, uncluttered workspace so that I can focus on my story cards without dashboard distractions.

#### Acceptance Criteria

1.1 WHEN the application loads THEN the system SHALL display a full-width open workspace without permanent sidebars.

1.2 WHEN viewing the main workspace THEN the system SHALL maximize whitespace and make cards the visual focus.

1.3 WHEN the user needs secondary controls THEN the system SHALL provide them in lightweight, tucked-away menus that appear on demand.

1.4 IF the current sidebar exists THEN the system SHALL remove it as a permanent fixture and replace its functions with contextual alternatives.

---

### 2. Bottom-Peeking New Card Composer

**User Story:** As a writer, I want a blank card always peeking from the bottom of the screen so that creating a new card feels like pulling one from a stack.

#### Acceptance Criteria

2.1 WHEN viewing the workspace THEN the system SHALL display a partially visible blank index card peeking up from the bottom center of the screen.

2.2 WHEN the user clicks the peeking card THEN the system SHALL pull a blank card into the center writing area.

2.3 WHEN the user presses the `N` key (while not focused on a text input) THEN the system SHALL open a new blank card in the center writing area.

2.4 WHEN a card is opened for writing THEN the animation SHALL feel like pulling an index card onto the desk.

2.5 WHEN the user wants a cleaner workspace THEN the system SHALL allow hiding the peeking card via a toggle or preference.

2.6 WHEN the peeking card is hidden THEN the user SHALL still be able to create new cards via the `N` shortcut or a menu action.

---

### 3. Front/Back Card Writing Flow

**User Story:** As a writer, I want to write the front of my card first and then flip it to add details so that the experience mirrors physical index cards.

#### Acceptance Criteria

3.1 WHEN a new card is opened THEN the system SHALL display the front side first for writing the main story beat.

3.2 WHEN viewing the card front THEN the system SHALL display fields for title and main scene/beat text.

3.3 WHEN the user wants to add details THEN the system SHALL provide a clearly visible "Flip" control.

3.4 WHEN the user clicks the Flip control THEN the system SHALL animate a card flip to reveal the back side.

3.5 WHEN viewing the card back THEN the system SHALL display fields for notes/details, tags, linked characters, and color selection.

3.6 WHEN the user presses the `F` key while a card is open in the composer AND focus is NOT on a text input THEN the system SHALL flip the card.

3.7 The system SHALL NOT auto-flip cards on hover.

---

### 4. Card Finishing and Placement

**User Story:** As a writer, I want to finish my card and have it animate into the workspace so that it feels like placing a physical card on my desk.

#### Acceptance Criteria

4.1 WHEN the user completes writing a card THEN the system SHALL provide a "Finish Card" action.

4.2 WHEN the user activates "Finish Card" THEN the system SHALL animate the card "plopping down" into the workspace grid.

4.3 WHEN a card is finished THEN the system SHALL reset the composer to a fresh blank state.

4.4 WHEN a card is finished THEN the bottom peeking card SHALL remain visible and available for the next card.

---

### 5. Card Type System (Story vs Character)

**User Story:** As a writer, I want story cards completely separate from character cards so that my plot and narrative flow is never mixed with character note-taking.

#### Acceptance Criteria

5.1 WHEN viewing the application THEN the system SHALL provide two distinct tabs: "Story" (default) and "Characters".

5.2 WHEN viewing the Story tab THEN the system SHALL display ONLY story cards in the workspace.

5.3 WHEN viewing the Characters tab THEN the system SHALL display ONLY character cards in a separate workspace.

5.4 WHEN creating a new card in the Story tab THEN the card type SHALL be "Story".

5.5 WHEN creating a new card in the Characters tab THEN the card type SHALL be "Character".

5.6 WHEN characters exist THEN the system SHALL offer them as selectable suggestions when linking characters to story cards (on the story card's back side).

5.7 WHEN a story card has linked characters THEN the system SHALL display them as small pills on the card back and optionally on the front.

5.8 Story cards and character cards SHALL NOT appear mixed together in the same view.

---

### 6. Color-Based Writing Function System

**User Story:** As a writer, I want to color-code my cards by writing function (action, dialogue, reflection, etc.) so that I can visually scan my story structure at a glance.

#### Acceptance Criteria

6.1 WHEN creating or editing a card THEN the system SHALL offer 10 color options.

6.2 WHEN displaying colors THEN the system SHALL provide default label meanings:
- Red = Action / High tension
- Blue = Reflection / Emotion
- Green = Description / Setting the scene
- Yellow = Dialogue / Interaction
- Purple = Mystery / Omen
- Orange = Conflict escalation
- Pink = Relationship / Intimacy
- Gray = Transition / Utility beat
- Brown = Backstory / Memory
- Teal = Discovery / Revelation

6.3 WHEN a user wants to customize color meanings THEN the system SHALL allow renaming the label for each color.

6.4 WHEN a card is displayed THEN the system SHALL show its color prominently as a visual identifier.

---

### 7. Tag System

**User Story:** As a writer, I want to tag my cards with story functions like "Twist" or "Setup" so that I can filter and organize without creating separate card types.

#### Acceptance Criteria

7.1 WHEN editing a card's back side THEN the system SHALL allow adding multiple tags.

7.2 WHEN suggesting tags THEN the system SHALL offer common story function tags: Twist, Reveal, Setup, Payoff, Conflict, Foreshadowing, Clue, Decision, Reversal, Theme.

7.3 WHEN a user types a new tag THEN the system SHALL allow custom tag creation.

7.4 WHEN viewing a card THEN the system SHALL display its tags on the back side.

---

### 8. Manual Drag-and-Drop Reordering

**User Story:** As a writer, I want to drag cards around freely so that I can arrange my story like physical cards on a desk.

#### Acceptance Criteria

8.1 WHEN viewing cards in the workspace THEN all cards SHALL be draggable.

8.2 WHEN the user drags a card THEN the system SHALL provide visual feedback (opacity change, slight rotation).

8.3 WHEN the user drops a card THEN the system SHALL update the story order immediately.

8.4 WHEN the user presses Cmd/Ctrl+Z THEN the system SHALL undo the last reorder operation.

---

### 9. Shuffle/Randomize Feature

**User Story:** As a writer, I want to shuffle my cards to discover unexpected narrative structures as a brainstorming aid.

#### Acceptance Criteria

9.1 WHEN the user activates shuffle THEN the system SHALL randomize the order of visible story cards.

9.2 WHEN cards are shuffled THEN the system SHALL provide an undo option to restore the previous order.

9.3 WHEN shuffling THEN the system SHALL animate the cards scattering briefly before settling.

---

### 10. Organization Modes

**User Story:** As a writer, I want to view my cards organized by different criteria without losing my manual order so that I can see my story from multiple perspectives.

#### Acceptance Criteria

10.1 WHEN viewing cards THEN the system SHALL support these organization modes:
- Manual order (default, hand-dragged arrangement)
- Order created (chronological by creation time)
- By color/writing function
- By tags

10.2 WHEN switching organization modes THEN the system SHALL NOT destroy the manual order.

10.3 WHEN returning to manual mode THEN the system SHALL restore the user's hand-arranged order.

---

### 11. Saved Story Flow Versions

**User Story:** As a writer, I want to save snapshots of my card order so that I can experiment with structure without losing prior arrangements.

#### Acceptance Criteria

11.1 WHEN the user wants to preserve the current order THEN the system SHALL allow saving it as a named version.

11.2 WHEN viewing a saved version THEN the system SHALL display cards in the order they were when saved.

11.3 IF new cards are created after a version was saved THEN the system SHALL show them in a separate "New since this version" section within that version view.

11.4 WHEN the user saves a version THEN the active deck SHALL continue evolving independently.

---

### 12. AI Summary Improvements

**User Story:** As a writer, I want reliable AI summaries of my story flow so that I can get a narrative overview of my card sequence.

#### Acceptance Criteria

12.1 WHEN the user requests a summary THEN the system SHALL summarize the current visible story flow.

12.2 WHEN a saved version is selected THEN the system SHALL allow summarizing that version's order.

12.3 IF the AI request fails THEN the system SHALL display a useful error message, not a generic failure.

12.4 IF the deck is empty THEN the system SHALL handle gracefully with an appropriate message.

12.5 WHEN the API encounters an error THEN the system SHALL log detailed server-side error information.

12.6 WHEN making AI requests THEN the system SHALL validate inputs before sending to the AI provider.

---

### 13. Data Model Updates

**User Story:** As a developer, I want a unified card model that supports both story and character types so that the system remains simple and extensible.

#### Acceptance Criteria

13.1 WHEN storing cards THEN the system SHALL use a unified model with a `type` field (`story` | `character`).

13.2 WHEN storing cards THEN the system SHALL support these fields:
- id, type, title, frontText, backText, color, colorLabel, tags[], linkedCharacterIds[], position, createdAt, updatedAt

13.3 WHEN storing deck preferences THEN the system SHALL persist user-customized color label mappings.

13.4 WHEN storing saved versions THEN the system SHALL persist the card order/positions at save time.

---

### 14. Keyboard Shortcuts

**User Story:** As a writer, I want keyboard shortcuts that help the app feel like a writing tool rather than a web app, without interfering with my typing.

#### Acceptance Criteria

14.1 WHEN the user presses `N` AND focus is NOT on a text input/textarea THEN the system SHALL open a new blank card.

14.2 WHEN the user presses `F` AND focus is NOT on a text input/textarea AND a card is open in the composer THEN the system SHALL flip the card.

14.3 WHEN the user presses `Cmd/Ctrl+Z` THEN the system SHALL undo the last reorder.

14.4 WHEN the user is typing in any text field (title, body, notes, etc.) THEN single-key shortcuts (N, F) SHALL NOT trigger.

14.5 The system SHALL NOT use `Cmd+Space` as it conflicts with system shortcuts.

14.6 WHEN implementing shortcuts THEN the system SHALL check `event.target.tagName` to ensure focus is not on `INPUT`, `TEXTAREA`, or `SELECT` elements before triggering single-key shortcuts.

---

## Non-Functional Requirements

### UX Principles

- The app SHALL feel like writing index cards, not managing a database
- The main action flow SHALL be: write → flip → finish → place
- Secondary controls SHALL stay tucked away unless explicitly opened
- The interface SHALL feel open, calm, and tactile
- Physical-card metaphors SHALL guide all animations and interactions

### Performance

- Card creation SHALL complete in under 10 seconds
- Animations SHALL run at 60fps
- The workspace SHALL handle 100+ cards without degradation

---

## Out of Scope

- Real-time collaboration (future feature)
- User accounts/authentication (existing owner-token system remains)
- Export to screenplay format (future feature)
- Mobile-specific redesign beyond responsive support
