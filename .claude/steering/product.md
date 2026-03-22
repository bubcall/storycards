# Storycards - Product Overview

## What It Is
Storycards is a browser-based story development tool that digitizes the screenwriter's 3x5 index card method. It combines the tactile experience of physical cards with software-unique capabilities: cloud persistence, AI-powered narrative summarization, shareable URLs, and rich organizational layers.

## Problem Solved
Writers using the analog index card method face a recurring issue: ideas die between the card and the computer. Physical cards get lost, forgotten, or can't maintain organization at scale. No existing digital tool faithfully replicates the physical experience while adding what software can uniquely offer.

## Target Users
- **Screenwriters** (amateur and professional) developing feature films, TV pilots, and shorts
- **Novelists and narrative game designers** who use beat-sheet methods
- **Writers' rooms and creative partnerships** needing shared, real-time boards
- **Film students** learning story structure

## Core Principles
1. **Speed first** - Card creation in under 10 seconds
2. **Tactile feel** - Drag, drop, shuffle, and reorder must feel physical and responsive
3. **Non-linear thinking** - Reward chaotic input; make structure emergent, not imposed
4. **Minimal friction** - No account required to start; save and share in one click

## Key Features

### Card System
Each card represents a single story beat, scene, plot point, character note, thematic idea, or world-building element. Cards have:
- Title (required, max 80 chars)
- Body text (optional, max 500 chars)
- Category: Plot, Character, World Building, Theme, Twist, or Scene
- Character tags (optional)
- Position in the deck

### Drag-and-Drop Reordering
The central interaction. Cards are fully draggable with visual feedback (semi-transparency, slight rotation). Position numbers update immediately. Supports undo with Cmd/Ctrl+Z.

### Shuffle Discovery
Randomize the deck to discover unexpected narrative structures. The AI summarizer can then reflect on the new order, revealing non-linear storytelling possibilities.

### AI Story Summarizer
Sends the current deck order to Claude API and returns a 3-5 sentence atmospheric overview. The AI summarizes the order AS IS, noting interesting non-linear effects. Writer-to-writer tone.

### Save & Share
- URL-based sharing (e.g., storycards.app/deck/abc123)
- Auto-save every 30 seconds and on every card action
- Read-only mode for shared links; fork to edit
- No account required for MVP
- JSON export for offline backup

### Filtering & Organization
- Category filter pills
- Character filter dropdown
- Live search by title and body text
- Filter state persists via localStorage

### Story Order View
Compact linear view in the sidebar showing cards in position order for at-a-glance structure review.

## Design Philosophy
Editorial stationery meets film production. Physical index card aesthetic: cream backgrounds, chosen typefaces, colored pen feel. Avoid: gradients, drop shadows, rounded blobs, "SaaS dashboard" aesthetic.
