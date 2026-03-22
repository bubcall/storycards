# Storycards MVP - Implementation Plan

## Phase 1: Core (Local State)

- [x] 1. Scaffold project with Vite + React + Tailwind + Zustand + dnd-kit
  - Initialize Vite project with React template
  - Install and configure Tailwind CSS with custom theme colors (#FAF8F3 background, #1A1714 ink, category colors)
  - Install Zustand for state management
  - Install @dnd-kit/core and @dnd-kit/sortable for drag-and-drop
  - Add Google Fonts: DM Serif Display, Figtree, DM Mono
  - Create base directory structure (components/, hooks/, store/, lib/, pages/)
  - _Requirements: Project setup, design system foundation_

- [x] 2. Create constants and design tokens
  - Create lib/constants.js with category definitions, colors, and labels
  - Define category enum: plot, character, world, theme, twist, scene
  - Define category colors map matching spec (#C8430A, #1A6B5A, #2952A3, #7B3FA8, #B8830A, #555555)
  - Add Tailwind CSS custom properties for theming
  - _Requirements: Design system, consistent styling_

- [x] 3. Build Card component with all display states
  - Create components/Card.jsx with full visual implementation
  - Implement category color band at top of card
  - Display category label and position number (DM Mono font)
  - Show title in DM Serif Display typeface
  - Show body text in Figtree (smaller weight)
  - Render character tags as inline pills
  - Add Edit and Delete buttons in card footer
  - Add drag handle element
  - Implement hover state (subtle lift in shadow)
  - Implement drag state (opacity 0.4, 2deg rotation)
  - _Requirements: Card display, visual design spec_

- [x] 4. Build Board component with responsive grid and dnd-kit drag-and-drop
  - Create components/Board.jsx with DndContext provider
  - Implement CSS Grid auto-fill layout (min 220px card width, 14px gap)
  - Wrap cards in SortableContext from dnd-kit
  - Make each Card a useSortable item
  - Implement drop target indicator (dashed outline in plot orange)
  - Handle onDragEnd to reorder cards array
  - Position numbers update immediately on drop
  - Implement empty state with prompt to add first card
  - Ensure vertical scrolling with fixed header area
  - _Requirements: Board layout, drag-and-drop reordering_

- [x] 5. Build Sidebar component with card form
  - Create components/Sidebar.jsx at 340px width on right side
  - Implement tab navigation (Form / Story Order / Summary placeholder)
  - Build Add/Edit card form with fields:
    - Category selector (dropdown with colored options)
    - Title input (required, max 80 chars)
    - Body textarea (optional, max 500 chars)
    - Character tags input (comma-separated or tag input)
  - Form opens pre-filled when editing existing card
  - Save button updates board without page reload
  - Implement form validation (red border + message if title empty)
  - _Requirements: Card creation & editing, sidebar UI_

- [x] 6. Build TopBar component with actions and filters
  - Create components/TopBar.jsx as fixed header
  - Add editable deck title field (defaults to "Untitled deck")
  - Add "+ New Card" button (opens sidebar form)
  - Add "Shuffle" button (placeholder functionality)
  - Add "Summarize" button (placeholder, disabled state)
  - Add Share button (placeholder)
  - Implement category filter pills (All, Plot, Character, World Building, Theme, Twist, Scene)
  - Add search input for live filtering by title/body
  - _Requirements: TopBar UI, filtering interface_

- [x] 7. Create Zustand store for deck and card state
  - Create store/deckStore.js with Zustand
  - Define deck state: id, title, cards array
  - Define UI state: activeFilter, searchQuery, editingCardId, sidebarTab
  - Implement actions: addCard, updateCard, deleteCard, reorderCards
  - Implement setFilter, setSearchQuery, setEditingCard actions
  - Add computed selector for filtered cards
  - _Requirements: State management, card CRUD operations_

- [x] 8. Wire up all components to Zustand store
  - Connect Board to cards state with filtering applied
  - Connect Sidebar form to addCard/updateCard actions
  - Connect TopBar filters to store state
  - Connect Card edit/delete buttons to store actions
  - Implement delete confirmation prompt
  - Ensure all state changes reflect immediately in UI
  - _Requirements: Component integration, reactive updates_

- [x] 9. Add sample cards and verify end-to-end functionality
  - Create 4-6 sample story cards in initial store state
  - Verify card display renders correctly
  - Test drag-and-drop reorder updates positions
  - Test add new card flow
  - Test edit existing card flow
  - Test delete card with confirmation
  - Test category and search filtering
  - Verify keyboard shortcut N opens new card form
  - _Requirements: Core functionality verification_

## Phase 2: Persistence (Supabase + API)

- [x] 10. Set up Supabase project and database schema
  - Create Supabase project
  - Create `decks` table (id uuid, title text, created_at, updated_at, owner_token text)
  - Create `cards` table (id uuid, deck_id uuid FK, title text, body text, category enum, characters text[], position integer, created_at, updated_at)
  - Set up Row Level Security policies
  - Configure environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)
  - _Requirements: Database setup, schema implementation_

- [x] 11. Build API routes for deck CRUD
  - Create POST /api/decks - creates new deck, returns deck ID and owner token
  - Create GET /api/decks/:id - fetches deck with all cards sorted by position
  - Create PATCH /api/decks/:id - updates deck title (requires owner token header)
  - Implement owner token validation middleware
  - _Requirements: Deck API endpoints_

- [x] 12. Build API routes for card CRUD
  - Create POST /api/decks/:id/cards - adds card to deck
  - Create PATCH /api/cards/:id - updates card fields
  - Create DELETE /api/cards/:id - deletes card
  - Create POST /api/decks/:id/reorder - batch updates positions after drag/drop
  - _Requirements: Card API endpoints_

- [x] 13. Create API client library
  - Create lib/api.js with fetch wrappers for all endpoints
  - Handle authentication headers (owner token)
  - Implement error handling and response parsing
  - _Requirements: Frontend API integration_

- [x] 14. Connect frontend to API for deck operations
  - On first load with no deck ID: POST /api/decks → redirect to /deck/[id]
  - Store owner_token in localStorage
  - Load deck from URL on visit via GET /api/decks/:id
  - Update store with fetched deck data
  - _Requirements: Deck loading and creation_

- [x] 15. Connect frontend to API for card operations
  - Wire addCard action to POST /api/decks/:id/cards
  - Wire updateCard action to PATCH /api/cards/:id
  - Wire deleteCard action to DELETE /api/cards/:id
  - Wire reorderCards action to POST /api/decks/:id/reorder
  - Implement optimistic updates with rollback on failure
  - _Requirements: Card persistence_

- [x] 16. Implement auto-save functionality
  - Create hooks/useDeck.js with auto-save logic
  - Save to backend every 30 seconds if changes exist
  - Save on every explicit card action
  - Add save state to store: 'saved', 'saving', 'unsaved'
  - Display save indicator in TopBar ("Saved" / "Saving..." / "Unsaved changes")
  - _Requirements: Auto-save, save state indicator_

- [x] 17. Implement shareable URLs and read-only mode
  - Deck loads from URL path /deck/[id]
  - Check localStorage for matching owner_token
  - If no token match: display in read-only mode (no edit/delete buttons, form disabled)
  - Add "Edit this deck" button in read-only mode that forks to new deck
  - URL is copyable from share button in toolbar
  - _Requirements: Sharing, read-only mode, forking_

## Phase 3: AI + Polish

- [x] 18. Build AI summarize API route
  - Create POST /api/decks/:id/summarize route
  - Fetch all cards for deck in position order
  - Construct prompt with cards in format: [Card N] [Category] "Title": Body...
  - Call Anthropic API (claude-sonnet-4-20250514) with system prompt and user prompt
  - Return summary text (3-5 sentences, max 400 tokens, temp 0.7)
  - Handle API errors with appropriate error responses
  - _Requirements: AI summarization backend_

- [x] 19. Build SummaryPanel component
  - Create components/SummaryPanel.jsx for sidebar
  - Implement loading state with animated dots
  - Display summary text on success
  - Show error state with retry button on failure
  - Add re-summarize button (appears after first generation)
  - Cache summary by deck state hash (don't re-run if unchanged)
  - Display character index below summary (unique names with card count)
  - _Requirements: AI summary UI_

- [x] 20. Create useSummary hook
  - Create hooks/useSummary.js
  - Manage summary fetch state (loading, error, data)
  - Implement deck state hash computation
  - Cache results by hash to avoid unnecessary API calls
  - _Requirements: Summary state management_

- [x] 21. Build OrderList component for Story Order view
  - Create components/OrderList.jsx for sidebar tab
  - Show all cards in position order as compact list
  - Display: position number, category color dot, title, category label
  - Clicking a card scrolls to and highlights that card on board
  - Add Shuffle button within this view
  - _Requirements: Story Order sidebar view_

- [x] 22. Implement shuffle functionality
  - Add shuffle action to Zustand store
  - Randomize visible cards' positions (respects active category filter)
  - Implement 200ms scatter animation before cards settle
  - Store last 5 shuffle states for undo history
  - Update Story Order sidebar and trigger AI re-summary option
  - _Requirements: Shuffle feature, animation_

- [x] 23. Implement keyboard shortcuts
  - Add N shortcut to open new card form
  - Add Cmd/Ctrl+Z to undo last reorder
  - Implement undo stack for reorder operations
  - Ensure shortcuts work globally (not just when focused)
  - _Requirements: Keyboard shortcuts, undo_

- [x] 24. Implement character filtering
  - Extract all unique character names from card tags
  - Add character filter dropdown to TopBar
  - Selecting a character shows only cards where that character is tagged
  - Character filter combines with category filter
  - _Requirements: Character filtering_

- [x] 25. Add JSON export functionality
  - Add "Export" option to TopBar or menu
  - Download deck as JSON file with all card data
  - Include deck title and metadata in export
  - _Requirements: Offline backup_

- [x] 26. Implement responsive design and mobile support
  - Desktop (≥1200px): sidebar open at 340px
  - Tablet (768–1199px): sidebar collapsed, toggleable via hamburger
  - Mobile (<768px): sidebar becomes bottom sheet, single-column card list
  - Test and fix touch drag-and-drop on mobile (dnd-kit native support)
  - _Requirements: Responsive behavior, touch support_

## Phase 4: Launch

- [ ] 27. Deploy to Vercel
  - Configure Vercel project
  - Set environment variables (ANTHROPIC_API_KEY, SUPABASE_*, NEXT_PUBLIC_APP_URL)
  - Verify build and deployment succeeds
  - Test all functionality in production environment
  - _Requirements: Production deployment_

- [ ] 28. Add meta tags and social sharing
  - Add og:title, og:description, og:image meta tags
  - Create og:image asset for link sharing
  - Add Twitter card meta tags
  - Test link previews on Twitter, Slack, Discord
  - _Requirements: Social sharing, SEO_

- [ ] 29. Cross-browser testing
  - Test on Chrome (desktop + Android)
  - Test on Safari (desktop + iOS)
  - Test on Firefox
  - Document and fix any browser-specific issues
  - _Requirements: Browser compatibility_

- [ ] 30. Create onboarding experience
  - Write one-paragraph onboarding overlay for first-time visitors
  - Show overlay on first visit (track in localStorage)
  - Include dismiss button and "Don't show again" option
  - Briefly explain the index card method and app features
  - _Requirements: User onboarding_
