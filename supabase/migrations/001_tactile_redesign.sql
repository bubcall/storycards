-- Migration: Tactile Card UX Redesign
-- Run this in Supabase SQL Editor to migrate existing database

-- ============================================
-- STEP 1: Create card_type enum
-- ============================================
CREATE TYPE card_type AS ENUM ('story', 'character');

-- ============================================
-- STEP 2: Add new columns to cards table
-- ============================================
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS type card_type DEFAULT 'story',
  ADD COLUMN IF NOT EXISTS front_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS back_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'gray',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linked_character_ids UUID[] DEFAULT '{}';

-- ============================================
-- STEP 3: Migrate existing data
-- ============================================

-- Map old category to new type (character category -> character type, all else -> story)
UPDATE cards SET type = 'character' WHERE category = 'character';
UPDATE cards SET type = 'story' WHERE category != 'character';

-- Copy body to front_text
UPDATE cards SET front_text = COALESCE(body, '');

-- Map old category to new color system
UPDATE cards SET color = CASE category
  WHEN 'plot' THEN 'orange'
  WHEN 'character' THEN 'green'
  WHEN 'world' THEN 'blue'
  WHEN 'theme' THEN 'purple'
  WHEN 'twist' THEN 'red'
  WHEN 'scene' THEN 'gray'
  ELSE 'gray'
END;

-- ============================================
-- STEP 4: Add color_labels to decks table
-- ============================================
ALTER TABLE decks
  ADD COLUMN IF NOT EXISTS color_labels JSONB DEFAULT '{
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

-- ============================================
-- STEP 5: Create saved_versions table
-- ============================================
CREATE TABLE IF NOT EXISTS saved_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_positions JSONB NOT NULL DEFAULT '[]',
  card_ids_at_save TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by deck
CREATE INDEX IF NOT EXISTS idx_saved_versions_deck ON saved_versions(deck_id);

-- ============================================
-- STEP 6: RLS for saved_versions
-- ============================================
ALTER TABLE saved_versions ENABLE ROW LEVEL SECURITY;

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
-- STEP 7: Add index for color-based queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cards_color ON cards(color);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);

-- ============================================
-- VERIFICATION QUERIES (run to check migration)
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cards';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'decks';
-- SELECT * FROM saved_versions LIMIT 1;
