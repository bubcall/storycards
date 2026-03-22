# Design Document: Tactile Card UX Redesign

## Overview

This design document describes the architecture, components, and data models for transforming Storycards from a dashboard-style application into a tactile, physical-card-focused writing experience. The redesign eliminates the permanent sidebar, introduces a bottom-peeking card composer with front/back flip mechanics, separates story and character cards into distinct tabs, and adds a 10-color writing function system with saved story flow versions.

---

## Architecture

### High-Level Component Structure

```
App
├── TopBar (minimal)
│   ├── DeckTitle
│   ├── TabSwitcher (Story | Characters)
│   ├── ViewModeSelector (Manual | Created | Color | Tags)
│   ├── ActionMenu (Shuffle, Summary, Share, Export, Settings)
│   └── SaveIndicator
├── Workspace
│   ├── CardBoard (dnd-kit grid of cards)
│   │   └── StoryCard[] or CharacterCard[] (based on active tab)
│   ├── CardComposer (central overlay when active)
│   │   ├── CardFront
│   │   ├── CardBack
│   │   └── FlipControl
│   └── PeekingCard (bottom of screen, hideable)
├── SummaryModal (on-demand)
├── VersionsPanel (slide-out, on-demand)
└── SettingsModal (color label customization)
```

### State Management (Zustand)

The store will be refactored to support:

```javascript
{
  // Deck
  deck: { id, title, ownerToken, createdAt, updatedAt },

  // Cards (unified model)
  cards: Card[],

  // UI State
  ui: {
    activeTab: 'story' | 'characters',
    viewMode: 'manual' | 'created' | 'color' | 'tags',
    selectedTags: string[],
    searchQuery: string,
    composerOpen: boolean,
    composerCardId: string | null, // null = new card
    composerSide: 'front' | 'back',
    peekingCardVisible: boolean,
    summaryModalOpen: boolean,
    versionsPanelOpen: boolean,
    settingsModalOpen: boolean,
  },

  // Color Labels (user-customizable)
  colorLabels: {
    red: 'Action / High tension',
    blue: 'Reflection / Emotion',
    green: 'Description / Setting',
    yellow: 'Dialogue / Interaction',
    purple: 'Mystery / Omen',
    orange: 'Conflict escalation',
    pink: 'Relationship / Intimacy',
    gray: 'Transition / Utility beat',
    brown: 'Backstory / Memory',
    teal: 'Discovery / Revelation',
  },

  // Saved Versions
  savedVersions: SavedVersion[],
  activeVersionId: string | null, // null = live deck

  // Reorder History (for undo)
  reorderHistory: Card[][],

  // Save State
  saveStatus: 'saved' | 'saving' | 'unsaved',
}
```

---

## Components and Interfaces

### 1. Workspace Component

The main workspace replaces the current Board + Sidebar layout.

```jsx
function Workspace() {
  // Full-width, full-height container
  // Contains: CardBoard, CardComposer (overlay), PeekingCard
  // No permanent sidebars
}
```

**Layout:**
- Background: cream (#FAF8F3)
- Cards displayed in CSS Grid (auto-fill, minmax(240px, 1fr))
- Generous padding (32px on desktop, 16px on mobile)
- CardComposer appears as centered overlay with backdrop blur

### 2. CardBoard Component

Displays cards based on active tab and view mode.

```jsx
function CardBoard({ cards, viewMode, onReorder }) {
  // Filter cards by type based on activeTab
  // Sort/group based on viewMode
  // Wrap in DndContext for drag-and-drop
}
```

**View Modes:**
- `manual`: Cards in user-dragged `position` order
- `created`: Cards sorted by `createdAt` ascending
- `color`: Cards grouped by color, each group in position order
- `tags`: Cards filtered by selected tags, in position order

### 3. StoryCard Component

Redesigned card for the workspace (not the composer).

```jsx
function StoryCard({ card, onClick, onDragStart }) {
  // Visual structure:
  // - Color band at top (full width, 8px height)
  // - Position number (top-left, muted)
  // - Title (DM Serif Display)
  // - Front text preview (truncated, 2-3 lines)
  // - Character pills (if any, bottom)
  // - Tag pills (small, muted)
}
```

**Card Dimensions:**
- Min width: 240px
- Aspect ratio: approximately 3:4 (index card proportions)
- Hover: subtle lift shadow
- Dragging: 0.7 opacity, 3deg rotation

### 4. CardComposer Component

Central overlay for writing/editing cards.

```jsx
function CardComposer({ cardId, onSave, onCancel }) {
  const [side, setSide] = useState('front');
  const [cardData, setCardData] = useState(initialData);

  // Renders CardFront or CardBack based on side
  // Flip button toggles side with animation
  // Finish button saves and closes
}
```

**Layout:**
- Centered modal (max-width: 480px)
- Backdrop: semi-transparent blur
- Card visual: realistic index card with shadow
- Flip animation: 3D CSS transform (rotateY)

### 5. CardFront Component

Front side of the composer card.

```jsx
function CardFront({ title, frontText, color, onChange }) {
  return (
    <div className="card-front">
      <ColorSelector selected={color} onChange={...} />
      <input placeholder="Card title..." value={title} />
      <textarea placeholder="What happens in this beat?" value={frontText} />
      <FlipButton onClick={onFlip} label="Flip to add details →" />
    </div>
  );
}
```

### 6. CardBack Component

Back side of the composer card.

```jsx
function CardBack({ backText, tags, linkedCharacters, onChange }) {
  return (
    <div className="card-back">
      <textarea placeholder="Notes, details, context..." value={backText} />
      <TagInput selected={tags} suggestions={STORY_TAGS} onChange={...} />
      <CharacterLinker selected={linkedCharacters} characters={allCharacters} />
      <FlipButton onClick={onFlip} label="← Back to front" />
      <FinishButton onClick={onFinish} label="Place Card" />
    </div>
  );
}
```

### 7. PeekingCard Component

Bottom-peeking new card trigger.

```jsx
function PeekingCard({ visible, onClick }) {
  if (!visible) return null;

  return (
    <div className="peeking-card" onClick={onClick}>
      {/* Partial card visual peeking from bottom */}
      <span className="hint">+ New Card</span>
    </div>
  );
}
```

**Styling:**
- Fixed position: bottom center
- Transform: translateY(70%) - only top 30% visible
- Hover: translateY(60%) with transition
- Click: triggers composer open animation

### 8. ColorSelector Component

10-color picker for card writing function.

```jsx
function ColorSelector({ selected, onChange, colorLabels }) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple',
                  'orange', 'pink', 'gray', 'brown', 'teal'];

  return (
    <div className="color-selector">
      {colors.map(color => (
        <button
          key={color}
          className={`color-dot ${color} ${selected === color ? 'selected' : ''}`}
          onClick={() => onChange(color)}
          title={colorLabels[color]}
        />
      ))}
    </div>
  );
}
```

**Color Values:**
```javascript
const CARD_COLORS = {
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  yellow: '#CA8A04',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#DB2777',
  gray: '#6B7280',
  brown: '#92400E',
  teal: '#0D9488',
};
```

### 9. TabSwitcher Component

Toggle between Story and Characters views.

```jsx
function TabSwitcher({ activeTab, onChange }) {
  return (
    <div className="tab-switcher">
      <button
        className={activeTab === 'story' ? 'active' : ''}
        onClick={() => onChange('story')}
      >
        Story
      </button>
      <button
        className={activeTab === 'characters' ? 'active' : ''}
        onClick={() => onChange('characters')}
      >
        Characters
      </button>
    </div>
  );
}
```

### 10. SavedVersionsPanel Component

Slide-out panel for managing story flow versions.

```jsx
function SavedVersionsPanel({ versions, activeVersionId, onSelect, onSave }) {
  return (
    <aside className="versions-panel">
      <h3>Saved Versions</h3>
      <button onClick={onSave}>Save Current Order</button>
      <ul>
        <li
          className={!activeVersionId ? 'active' : ''}
          onClick={() => onSelect(null)}
        >
          Live Deck
        </li>
        {versions.map(v => (
          <li
            key={v.id}
            className={activeVersionId === v.id ? 'active' : ''}
            onClick={() => onSelect(v.id)}
          >
            {v.name} ({v.cardCount} cards)
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

---

## Data Models

### Card Model (Unified)

```typescript
interface Card {
  id: string;
  deckId: string;
  type: 'story' | 'character';

  // Content
  title: string;
  frontText: string;      // Main beat/scene (story) or overview (character)
  backText: string;       // Notes/details

  // Categorization
  color: CardColor;       // One of 10 colors
  tags: string[];         // Story function tags
  linkedCharacterIds: string[];  // For story cards linking to characters

  // Ordering
  position: number;       // Manual order position

  // Metadata
  createdAt: string;
  updatedAt: string;
}

type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' |
                 'orange' | 'pink' | 'gray' | 'brown' | 'teal';
```

### Saved Version Model

```typescript
interface SavedVersion {
  id: string;
  deckId: string;
  name: string;
  cardPositions: { cardId: string; position: number }[];
  cardIdsAtSaveTime: string[];  // To identify "new since" cards
  createdAt: string;
}
```

### Deck Model (Extended)

```typescript
interface Deck {
  id: string;
  title: string;
  ownerToken: string;
  colorLabels: Record<CardColor, string>;  // User-customized labels
  createdAt: string;
  updatedAt: string;
}
```

---

## Database Schema Changes

### Cards Table Updates

```sql
ALTER TABLE cards
  ADD COLUMN type TEXT DEFAULT 'story' CHECK (type IN ('story', 'character')),
  ADD COLUMN front_text TEXT,
  ADD COLUMN back_text TEXT,
  ADD COLUMN color TEXT DEFAULT 'gray',
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN linked_character_ids UUID[] DEFAULT '{}';

-- Migrate existing data
UPDATE cards SET
  type = CASE WHEN category = 'character' THEN 'character' ELSE 'story' END,
  front_text = body,
  color = CASE category
    WHEN 'plot' THEN 'orange'
    WHEN 'character' THEN 'green'
    WHEN 'world' THEN 'blue'
    WHEN 'theme' THEN 'purple'
    WHEN 'twist' THEN 'red'
    WHEN 'scene' THEN 'gray'
    ELSE 'gray'
  END;

-- Remove old column after migration
ALTER TABLE cards DROP COLUMN category;
ALTER TABLE cards DROP COLUMN body;
ALTER TABLE cards RENAME COLUMN characters TO legacy_characters;
```

### Decks Table Updates

```sql
ALTER TABLE decks
  ADD COLUMN color_labels JSONB DEFAULT '{
    "red": "Action / High tension",
    "blue": "Reflection / Emotion",
    "green": "Description / Setting",
    "yellow": "Dialogue / Interaction",
    "purple": "Mystery / Omen",
    "orange": "Conflict escalation",
    "pink": "Relationship / Intimacy",
    "gray": "Transition / Utility beat",
    "brown": "Backstory / Memory",
    "teal": "Discovery / Revelation"
  }';
```

### New Table: Saved Versions

```sql
CREATE TABLE saved_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_positions JSONB NOT NULL,  -- [{cardId, position}, ...]
  card_ids_at_save TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_versions_deck ON saved_versions(deck_id);
```

---

## Animation Specifications

### Card Flip Animation

```css
.card-composer {
  perspective: 1000px;
}

.card-inner {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Peeking Card Animation

```css
.peeking-card {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(70%);
  transition: transform 0.3s ease-out;
}

.peeking-card:hover {
  transform: translateX(-50%) translateY(50%);
}

.peeking-card.opening {
  animation: pullUp 0.4s ease-out forwards;
}

@keyframes pullUp {
  to {
    transform: translateX(-50%) translateY(-100vh) scale(1.1);
    opacity: 0;
  }
}
```

### Card Placement Animation

```css
@keyframes placeCard {
  0% {
    transform: scale(1.1) translateY(-20px);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05) translateY(5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.card-placing {
  animation: placeCard 0.4s ease-out;
}
```

---

## Error Handling

### AI Summary Error Handling

```javascript
// api/decks/[id]/summarize.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Validate deck exists
    const deck = await getDeck(id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Validate cards exist
    const cards = await getCardsForDeck(id);
    if (cards.length === 0) {
      return res.status(400).json({
        error: 'No cards to summarize',
        message: 'Add some story cards before generating a summary.'
      });
    }

    // Filter to story cards only
    const storyCards = cards.filter(c => c.type === 'story');
    if (storyCards.length === 0) {
      return res.status(400).json({
        error: 'No story cards',
        message: 'Add story cards to generate a narrative summary.'
      });
    }

    // Call Anthropic API with try/catch
    const summary = await generateSummary(storyCards);
    return res.status(200).json({ summary });

  } catch (error) {
    console.error('Summary generation error:', error);
    return res.status(500).json({
      error: 'Summary generation failed',
      message: 'Unable to generate summary. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

---

## Testing Strategy

### Unit Tests
- Card model validation
- Color label customization
- View mode sorting/filtering
- Keyboard shortcut detection (focus checking)

### Component Tests
- CardComposer flip behavior
- PeekingCard visibility toggle
- TabSwitcher state management
- ColorSelector selection

### Integration Tests
- Create card flow: peek → open → write → flip → finish → place
- Edit existing card flow
- Saved version creation and loading
- AI summary with error states

### E2E Tests
- Full user journey: create deck → add cards → reorder → save version → summarize
- Character linking workflow
- Mobile touch interactions

---

## Migration Strategy

1. **Database migration**: Add new columns, migrate data, remove old columns
2. **API updates**: Support new card fields, add saved versions endpoints
3. **Frontend refactor**: Replace Sidebar with Workspace, implement composer
4. **Feature flag**: Allow rollback to old UI during transition
5. **Data backfill**: Convert existing category to color mapping
