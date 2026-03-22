# Storycards - Project Structure & Architecture

## Directory Structure

```
src/
├── components/
│   ├── Card.jsx           # Individual index card component
│   ├── Board.jsx          # Card grid with dnd-kit provider
│   ├── Sidebar.jsx        # Add/edit form, story order, summary panel
│   ├── TopBar.jsx         # Title, actions, filter pills
│   ├── SummaryPanel.jsx   # AI summary display
│   └── OrderList.jsx      # Linear narrative order view
├── hooks/
│   ├── useDeck.js         # Deck fetch, save, auto-save logic
│   ├── useCards.js        # Card CRUD operations
│   └── useSummary.js      # AI summary fetch, cache
├── store/
│   └── deckStore.js       # Zustand store (cards, deck, UI state)
├── lib/
│   ├── api.js             # All fetch calls to /api/*
│   └── constants.js       # Category definitions, colors, labels
└── pages/
    ├── index.jsx          # Redirect to new deck
    └── deck/[id].jsx      # Main app page
```

## Architecture Patterns

### State Management (Zustand)
The application uses Zustand for lightweight, boilerplate-free state management. The store holds:
- **Deck data**: id, title, owner_token
- **Cards array**: All cards with their properties
- **UI state**: Active filters, sidebar tab, editing card ID
- **Save state**: dirty flag, last saved timestamp

### Component Hierarchy

```
App
├── TopBar
│   ├── DeckTitle (editable)
│   ├── ActionButtons (New Card, Shuffle, Summarize, Share)
│   ├── FilterPills (category toggles)
│   └── SearchInput
├── Board
│   ├── DndContext (dnd-kit provider)
│   └── Card[] (draggable cards in grid)
└── Sidebar
    ├── TabNav (Form / Story Order / Summary)
    ├── CardForm (add/edit)
    ├── OrderList (linear view)
    └── SummaryPanel (AI output)
```

### Data Flow

1. **Initial Load**:
   - Check URL for deck ID
   - If no ID: POST `/api/decks` → redirect to `/deck/[newId]`
   - If ID exists: GET `/api/decks/:id` → populate store

2. **Card Operations**:
   - User action → Update Zustand store (optimistic)
   - Trigger API call → On success: confirm; On failure: rollback
   - Mark deck as dirty for auto-save

3. **Drag-and-Drop**:
   - dnd-kit handles drag events
   - On drop: Reorder cards array in store
   - POST `/api/decks/:id/reorder` with new positions
   - All position numbers update immediately

4. **AI Summary**:
   - User clicks Summarize
   - Compute deck state hash
   - If cached: return cached summary
   - Else: POST `/api/decks/:id/summarize` → display result

### Key Interfaces

```typescript
interface Deck {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  owner_token: string;
}

interface Card {
  id: string;
  deck_id: string;
  title: string;
  body: string;
  category: 'plot' | 'character' | 'world' | 'theme' | 'twist' | 'scene';
  characters: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

type CategoryColor = {
  plot: '#C8430A';
  character: '#1A6B5A';
  world: '#2952A3';
  theme: '#7B3FA8';
  twist: '#B8830A';
  scene: '#555555';
};
```

## Build Phases

### Phase 1: Core (Local State)
1. Scaffold: Vite + React + Tailwind + Zustand + dnd-kit
2. Card component with all display states
3. Board with responsive grid and drag-and-drop
4. Sidebar with new card form
5. Zustand store: add, edit, delete, reorder in local state
6. Verify drag-and-drop end-to-end

### Phase 2: Persistence (Supabase)
7. Supabase setup: decks and cards tables
8. Next.js API routes for CRUD
9. Connect frontend to API
10. Auto-save with debounce
11. Shareable URL loading
12. Owner token for edit/read-only modes

### Phase 3: AI + Polish
13. `/api/decks/:id/summarize` route with Anthropic API
14. SummaryPanel component (loading, error, success states)
15. Filter pills with category/character filtering
16. Story Order sidebar tab
17. Shuffle animation
18. Keyboard shortcuts (N = new card, Cmd+Z = undo)
19. JSON export
20. Mobile touch drag testing

### Phase 4: Launch
21. Deploy to Vercel
22. og:image and meta tags
23. Cross-browser testing
24. Onboarding overlay
25. Soft launch

## File Naming Conventions

- **Components**: PascalCase (e.g., `Card.jsx`, `SummaryPanel.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDeck.js`)
- **Store files**: camelCase with `Store` suffix (e.g., `deckStore.js`)
- **Utility files**: camelCase (e.g., `api.js`, `constants.js`)
- **Pages**: lowercase with brackets for dynamic routes (e.g., `deck/[id].jsx`)

## Key Dependencies

```json
{
  "react": "^18.x",
  "vite": "latest",
  "tailwindcss": "latest",
  "zustand": "latest",
  "@dnd-kit/core": "latest",
  "@dnd-kit/sortable": "latest",
  "@supabase/supabase-js": "latest"
}
```

## Testing Strategy

- Unit tests for Zustand store actions
- Component tests for Card rendering states
- Integration tests for drag-and-drop reordering
- API route tests for CRUD operations
- E2E tests for full user flows (create deck → add cards → reorder → share)
