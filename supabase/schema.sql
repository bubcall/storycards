-- Storycards Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create category enum type
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
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  category card_category NOT NULL DEFAULT 'plot',
  characters TEXT[] DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by deck
CREATE INDEX idx_cards_deck_id ON cards(deck_id);

-- Index for ordering cards within a deck
CREATE INDEX idx_cards_deck_position ON cards(deck_id, position);

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

-- Decks: Anyone can read any deck (for sharing)
CREATE POLICY "Decks are viewable by everyone"
  ON decks FOR SELECT
  USING (true);

-- Decks: Anyone can create a deck
CREATE POLICY "Anyone can create a deck"
  ON decks FOR INSERT
  WITH CHECK (true);

-- Decks: Only update if you have the owner_token (checked at API level)
-- For now, allow all updates (API will verify owner_token)
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
