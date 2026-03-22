# Storycards - Technical Stack & Guidelines

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS + CSS variables for theming |
| Drag and Drop | dnd-kit (accessible, touch-compatible, performant) |
| State Management | Zustand (lightweight, no boilerplate) |
| Backend | Next.js API routes (or Express if deployed separately) |
| Database | Supabase (Postgres + realtime + free tier) |
| AI API | Anthropic Claude API (claude-sonnet-4-20250514) |
| Hosting | Vercel (frontend + API routes) |
| Auth (v2) | Supabase Auth |

## Environment Variables

| Variable | Description | Scope |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | Anthropic API key | Server-side only |
| `SUPABASE_URL` | Supabase project URL | Both |
| `SUPABASE_ANON_KEY` | Supabase anon public key | Client-safe |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Server-side only |
| `NEXT_PUBLIC_APP_URL` | Base URL of deployed app | Client-safe |

## Database Schema

### `decks` table
| Column | Type / Notes |
|--------|--------------|
| id | uuid, primary key, auto-generated |
| title | text, default 'Untitled deck' |
| created_at | timestamp |
| updated_at | timestamp |
| owner_token | text — random string in localStorage for edit auth |

### `cards` table
| Column | Type / Notes |
|--------|--------------|
| id | uuid, primary key |
| deck_id | uuid, foreign key → decks.id |
| title | text, required |
| body | text |
| category | enum: plot, character, world, theme, twist, scene |
| characters | text[] (array of character name strings) |
| position | integer (1-indexed, unique per deck) |
| created_at | timestamp |
| updated_at | timestamp |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/decks` | POST | Create new deck, returns deck ID and owner token |
| `/api/decks/:id` | GET | Fetch deck + all cards (sorted by position) |
| `/api/decks/:id` | PATCH | Update deck title (requires owner token in header) |
| `/api/decks/:id/cards` | POST | Add card to deck |
| `/api/cards/:id` | PATCH | Update card (title, body, category, chars, position) |
| `/api/cards/:id` | DELETE | Delete card |
| `/api/decks/:id/reorder` | POST | Batch update positions after drag/drop or shuffle |
| `/api/decks/:id/summarize` | POST | Trigger AI summary — proxies to Anthropic API |

## Design System

### Colors
- **Background**: `#FAF8F3` (warm cream)
- **Ink**: `#1A1714`
- **Muted**: `#6B665E`
- **Faint**: `#B8B3AA`

### Category Colors
| Category | Color |
|----------|-------|
| Plot | `#C8430A` (burnt orange) |
| Character | `#1A6B5A` (forest green) |
| World Building | `#2952A3` (deep blue) |
| Theme | `#7B3FA8` (purple) |
| Twist | `#B8830A` (amber) |
| Scene | `#555555` (neutral gray) |

### Typography
| Use | Font |
|-----|------|
| Card titles, deck title | DM Serif Display (Google Fonts) |
| Body text, UI labels | Figtree (Google Fonts) |
| Card position numbers | DM Mono |
| Code / data display | DM Mono |

## Development Guidelines

### Card Component Requirements
- Category color band at top
- Category label and position number
- Title in display typeface (DM Serif Display)
- Body text in smaller weight (Figtree)
- Character tags as inline pills
- Edit and Delete buttons in footer
- Drag handle

### Board Layout
- Auto-fill grid with CSS Grid
- Minimum card width: 220px
- Gap: 14px
- Cards scroll vertically; header stays fixed
- Empty state with prompt when deck is empty

### Drag-and-Drop Behavior
- Cards draggable by drag handle or full card body
- Dragged card: opacity 0.4, 2deg rotation
- Drop target: dashed outline in plot orange
- Position numbers update immediately
- Undo last reorder with Cmd/Ctrl+Z
- Touch-drag support required for mobile

### Responsive Breakpoints
- **Desktop (≥1200px)**: Sidebar open at 340px, board fills remaining width
- **Tablet (768–1199px)**: Sidebar collapsed by default, toggleable
- **Mobile (<768px)**: Sidebar becomes bottom sheet; single-column card list

### AI Summarizer Implementation
- Model: `claude-sonnet-4-20250514`
- Max tokens: 400
- Temperature: 0.7
- System prompt: Story development assistant, concise and evocative, writer-to-writer tone
- Cache summary by deck state hash
- API key stays server-side only

### Auto-Save Behavior
- Save to backend every 30 seconds if changes exist
- Save on every explicit card action (add, edit, delete, reorder)
- Toolbar indicator: "Saved" / "Saving..." / "Unsaved changes"

### Security Notes
- Owner token stored in localStorage for edit authorization
- Shared URLs open in read-only mode by default
- API keys never exposed to client
- Service key for server-side Supabase operations only
