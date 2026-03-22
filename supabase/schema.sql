-- Storycards Database Schema (v2 - Tactile Redesign)
-- Run this in your Supabase SQL Editor for fresh installs
-- For migrations from v1, use migrations/001_tactile_redesign.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Card type enum (story vs character)
CREATE TYPE card_type AS ENUM ('story', 'character');

-- Legacy category enum (kept for backwards compatibility during migration)
CREATE TYPE card_category AS ENUM (
  'plot',
  'character',
  'world',
  'theme',
  'twist',
  'scene'
);

-- ============================================
-- DECKS TABLE
-- ============================================
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'Untitled deck',
  owner_token TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
  color_labels JSONB DEFAULT '{
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
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by owner_token
CREATE INDEX idx_decks_owner_token ON decks(owner_token);

-- ============================================
-- CARDS TABLE
-- ============================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,

  -- Card type (story or character)
  type card_type NOT NULL DEFAULT 'story',

  -- Content
  title TEXT NOT NULL,
  front_text TEXT DEFAULT '',
  back_text TEXT DEFAULT '',

  -- Categorization
  color TEXT DEFAULT 'gray',
  tags TEXT[] DEFAULT '{}',
  linked_character_ids UUID[] DEFAULT '{}',

  -- Legacy fields (for migration compatibility)
  body TEXT DEFAULT '',
  category card_category DEFAULT 'plot',
  characters TEXT[] DEFAULT '{}',

  -- Ordering
  position INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cards
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_deck_position ON cards(deck_id, position);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_color ON cards(color);

-- ============================================
-- SAVED VERSIONS TABLE
-- ============================================
CREATE TABLE saved_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_positions JSONB NOT NULL DEFAULT '[]',
  card_ids_at_save TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for saved versions
CREATE INDEX idx_saved_versions_deck ON saved_versions(deck_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to decks table
CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to cards table
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_versions ENABLE ROW LEVEL SECURITY;

-- Decks: Anyone can read any deck (for sharing)
CREATE POLICY "Decks are viewable by everyone"
  ON decks FOR SELECT
  USING (true);

-- Decks: Anyone can create a deck
CREATE POLICY "Anyone can create a deck"
  ON decks FOR INSERT
  WITH CHECK (true);

-- Decks: Only update if you have the owner_token (checked at API level)
CREATE POLICY "Anyone can update decks"
  ON decks FOR UPDATE
  USING (true);

-- Decks: Allow delete (API will verify owner_token)
CREATE POLICY "Anyone can delete decks"
  ON decks FOR DELETE
  USING (true);

-- Cards: Anyone can read cards (for shared decks)
CREATE POLICY "Cards are viewable by everyone"
  ON cards FOR SELECT
  USING (true);

-- Cards: Anyone can insert cards
CREATE POLICY "Anyone can create cards"
  ON cards FOR INSERT
  WITH CHECK (true);

-- Cards: Anyone can update cards (API verifies deck ownership)
CREATE POLICY "Anyone can update cards"
  ON cards FOR UPDATE
  USING (true);

-- Cards: Anyone can delete cards (API verifies deck ownership)
CREATE POLICY "Anyone can delete cards"
  ON cards FOR DELETE
  USING (true);

-- Saved Versions: Same policies as other tables
CREATE POLICY "Saved versions are viewable by everyone"
  ON saved_versions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create saved versions"
  ON saved_versions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update saved versions"
  ON saved_versions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete saved versions"
  ON saved_versions FOR DELETE
  USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to reorder cards within a deck
CREATE OR REPLACE FUNCTION reorder_cards(
  p_deck_id UUID,
  p_card_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(p_card_ids, 1) LOOP
    UPDATE cards
    SET position = i
    WHERE id = p_card_ids[i]
      AND deck_id = p_deck_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
