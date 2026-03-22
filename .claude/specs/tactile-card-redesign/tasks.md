# Implementation Plan: Tactile Card UX Redesign

## Phase 1: Data Model & Database Migration

- [x] 1. Update database schema for new card model
  - Add migration SQL for cards table: type, front_text, back_text, color, tags, linked_character_ids columns
  - Add migration SQL for decks table: color_labels JSONB column
  - Create saved_versions table
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 2. Update Supabase schema.sql and run migration
  - Update supabase/schema.sql with new schema
  - Run migration in Supabase SQL Editor
  - Verify tables updated correctly
  - _Requirements: 13.1, 13.2_

- [x] 3. Update constants.js with new color system
  - Replace CATEGORIES with CARD_COLORS (10 colors with hex values)
  - Add DEFAULT_COLOR_LABELS object
  - Add STORY_TAGS array (Twist, Reveal, Setup, Payoff, etc.)
  - Remove old category-related constants
  - _Requirements: 6.1, 6.2, 7.2_

- [x] 4. Update lib/api.js for new card fields
  - Update addCard to support new fields (type, frontText, backText, color, tags, linkedCharacterIds)
  - Update updateCard to support new fields
  - Add API functions for saved versions (createVersion, getVersions, deleteVersion)
  - Update getDeck to include colorLabels
  - _Requirements: 13.1, 13.2, 11.1_

## Phase 2: Store Refactor

- [x] 5. Refactor deckStore.js for new data model
  - Update card state shape to match new model
  - Add ui.activeTab ('story' | 'characters')
  - Add ui.viewMode ('manual' | 'created' | 'color' | 'tags')
  - Add ui.composerOpen, ui.composerCardId, ui.composerSide
  - Add ui.peekingCardVisible (default true)
  - Add colorLabels state with defaults
  - Add savedVersions array and activeVersionId
  - _Requirements: 5.1, 10.1, 2.5, 6.2, 11.1_

- [x] 6. Add store actions for new features
  - Add setActiveTab action
  - Add setViewMode action
  - Add openComposer, closeComposer, flipComposer actions
  - Add togglePeekingCard action
  - Add updateColorLabel action
  - Add saveVersion, loadVersion, deleteVersion actions
  - _Requirements: 5.1, 10.1, 3.4, 2.5, 6.3, 11.1_

- [x] 7. Add computed selectors for filtered views
  - Add getCardsByTab selector (filters by type based on activeTab)
  - Add getCardsByViewMode selector (sorts/groups by viewMode)
  - Add getCardsForVersion selector (applies saved version positions)
  - Add getNewCardsSinceVersion selector
  - _Requirements: 5.2, 5.3, 10.1, 11.3_

## Phase 3: Layout Refactor

- [x] 8. Create new Workspace component
  - Create src/components/Workspace.jsx
  - Full-width, full-height layout without sidebar
  - Generous padding, cream background
  - Render CardBoard as main content
  - _Requirements: 1.1, 1.2_

- [x] 9. Refactor App.jsx to use Workspace
  - Remove Sidebar component from layout
  - Replace with new Workspace component
  - Keep TopBar but simplify it
  - Remove mobile bottom sheet sidebar code
  - _Requirements: 1.1, 1.4_

- [x] 10. Update TopBar for new design
  - Add TabSwitcher component (Story | Characters)
  - Add ViewModeSelector dropdown
  - Move actions to collapsible ActionMenu
  - Remove filter pills (replaced by view modes)
  - Keep deck title, save indicator
  - _Requirements: 5.1, 10.1, 1.3_

## Phase 4: Card Composer

- [x] 11. Create CardComposer component
  - Create src/components/CardComposer.jsx
  - Centered modal overlay with backdrop blur
  - Manage local card data state
  - Handle save and cancel actions
  - _Requirements: 3.1, 4.1_

- [x] 12. Create CardFront component
  - Create src/components/CardFront.jsx
  - Color selector at top
  - Title input field
  - Front text textarea (main beat/scene)
  - Flip button at bottom
  - _Requirements: 3.2, 3.3_

- [x] 13. Create CardBack component
  - Create src/components/CardBack.jsx
  - Back text textarea (notes/details)
  - Tag input with suggestions
  - Character linker (shows available characters)
  - Flip button and Finish button
  - _Requirements: 3.5, 7.1, 5.6_

- [x] 14. Implement card flip animation
  - Add 3D CSS transform for flip
  - Use perspective and rotateY
  - Smooth 0.5s transition
  - Backface visibility hidden
  - _Requirements: 3.4_

- [x] 15. Wire composer to store
  - Connect openComposer/closeComposer to store
  - Handle new card creation flow
  - Handle edit existing card flow
  - Save card on finish
  - _Requirements: 4.1, 4.3_

## Phase 5: Peeking Card

- [x] 16. Create PeekingCard component
  - Create src/components/PeekingCard.jsx
  - Fixed position at bottom center
  - Partial visibility (30% showing)
  - Hover animation to show more
  - Click triggers composer open
  - _Requirements: 2.1, 2.2_

- [x] 17. Implement peeking card visibility toggle
  - Add hide/show toggle in settings or TopBar
  - Persist preference in store
  - Still allow N shortcut when hidden
  - _Requirements: 2.5, 2.6_

- [x] 18. Add pull-up animation when opening
  - Animate peeking card pulling up and transforming into composer
  - Use keyframe animation
  - Sync with composer opening
  - _Requirements: 2.4_

## Phase 6: Card Placement Animation

- [x] 19. Implement card placement animation
  - Add "plop down" animation when finishing card
  - Scale and translate keyframes
  - Apply to newly placed card in grid
  - _Requirements: 4.2_

- [x] 20. Reset composer after placement
  - Clear composer state after card placed
  - Reset to front side
  - Keep peeking card visible
  - _Requirements: 4.3, 4.4_

## Phase 7: Redesigned Workspace Cards

- [x] 21. Create new StoryCard component for workspace
  - Create src/components/StoryCard.jsx (rename/refactor from Card.jsx)
  - Color band at top (new 10-color system)
  - Position number, title, front text preview
  - Character pills, tag pills
  - Click to edit (opens composer)
  - _Requirements: 6.4, 5.7_

- [x] 22. Create CharacterCard component
  - Create src/components/CharacterCard.jsx
  - Similar structure to StoryCard
  - Optimized for character info display
  - Click to edit in Characters tab
  - _Requirements: 5.3_

- [x] 23. Update CardBoard for tab filtering
  - Filter displayed cards by activeTab (story vs character)
  - Use getCardsByTab selector
  - Maintain drag-and-drop functionality
  - _Requirements: 5.2, 5.3, 5.8_

## Phase 8: Color System

- [x] 24. Create ColorSelector component
  - Create src/components/ColorSelector.jsx
  - 10 color dots in a row
  - Show label on hover (tooltip)
  - Highlight selected color
  - _Requirements: 6.1_

- [x] 25. Implement color label customization
  - Add Settings modal with color label editor
  - Allow renaming each color's label
  - Persist to deck's colorLabels field
  - _Requirements: 6.3_

- [x] 26. Update card display to use new colors
  - Apply color to card top band
  - Use new CARD_COLORS constants
  - Show color label in card details
  - _Requirements: 6.4_

## Phase 9: Tag System

- [x] 27. Create TagInput component
  - Create src/components/TagInput.jsx
  - Autocomplete with STORY_TAGS suggestions
  - Allow custom tag entry
  - Display as removable pills
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 28. Display tags on cards
  - Show tags as small pills on card back
  - Optionally show on front if space allows
  - Style consistently with color scheme
  - _Requirements: 7.4_

## Phase 10: Character Linking

- [x] 29. Create CharacterLinker component
  - Create src/components/CharacterLinker.jsx
  - Show dropdown of available character cards
  - Allow selecting multiple characters
  - Display as pills on card back
  - _Requirements: 5.6_

- [x] 30. Display linked characters on story cards
  - Show character pills on card back
  - Optionally show small pills on front
  - Link to character card on click (switch to Characters tab)
  - _Requirements: 5.7_

## Phase 11: View Modes

- [x] 31. Create ViewModeSelector component
  - Create src/components/ViewModeSelector.jsx
  - Dropdown with: Manual, Created, By Color, By Tags
  - Update store viewMode on selection
  - _Requirements: 10.1_

- [x] 32. Implement view mode sorting/grouping
  - Manual: sort by position
  - Created: sort by createdAt
  - By Color: group by color, then position
  - By Tags: filter by selected tags
  - _Requirements: 10.1_

- [x] 33. Preserve manual order when switching modes
  - Store manual positions separately
  - View modes are display-only, don't change positions
  - Return to manual mode restores hand-arranged order
  - _Requirements: 10.2, 10.3_

## Phase 12: Saved Versions

- [ ] 34. Create SavedVersionsPanel component
  - Create src/components/SavedVersionsPanel.jsx
  - Slide-out panel triggered from TopBar
  - List saved versions with names and card counts
  - "Save Current Order" button
  - _Requirements: 11.1_

- [ ] 35. Implement save version functionality
  - Capture current card positions
  - Capture card IDs at save time
  - Prompt for version name
  - Save to database
  - _Requirements: 11.1_

- [ ] 36. Implement load version functionality
  - Apply saved positions to current cards
  - Show "New since this version" section for newer cards
  - Allow switching back to live deck
  - _Requirements: 11.2, 11.3, 11.4_

## Phase 13: Keyboard Shortcuts

- [x] 37. Update keyboard shortcut handling
  - Check event.target.tagName before triggering shortcuts
  - Skip shortcuts when focused on INPUT, TEXTAREA, SELECT
  - N opens composer (when not typing)
  - F flips card (when composer open and not typing)
  - Cmd/Ctrl+Z undoes reorder
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6_

## Phase 14: AI Summary Fixes

- [ ] 38. Fix and harden summarize API route
  - Add input validation (deck exists, cards exist)
  - Filter to story cards only
  - Add detailed error logging
  - Return useful error messages
  - Handle empty deck gracefully
  - _Requirements: 12.3, 12.4, 12.5, 12.6_

- [ ] 39. Update summary UI for better error handling
  - Display specific error messages from API
  - Show helpful state for empty deck
  - Add retry button on failure
  - _Requirements: 12.3, 12.4_

- [ ] 40. Add summary for saved versions
  - Allow summarizing a specific saved version
  - Pass version positions to summary generation
  - _Requirements: 12.2_

## Phase 15: Polish & Cleanup

- [x] 41. Remove old components
  - Remove or archive old Sidebar.jsx
  - Remove old CardForm.jsx
  - Remove old category-based filtering code
  - Clean up unused constants
  - _Requirements: 1.4_

- [x] 42. Update responsive design
  - Ensure workspace works on mobile
  - Make composer responsive
  - Touch-friendly peeking card
  - _Requirements: 8.1_

- [x] 43. Add loading and empty states
  - Loading state for workspace
  - Empty state for no cards
  - Empty state for Characters tab
  - _Requirements: 12.4_

- [x] 44. Final UI polish
  - Consistent spacing and typography
  - Smooth animations throughout
  - Hover states and focus indicators
  - _Requirements: UX Principles_

- [x] 45. Update onboarding for new UX
  - Update Onboarding.jsx text for new flow
  - Explain write → flip → finish → place
  - Mention keyboard shortcuts
  - _Requirements: UX Principles_
