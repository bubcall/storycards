/**
 * API Service Layer
 * Provides CRUD operations for decks and cards via Supabase
 * These functions mirror the API routes defined in the spec
 */

import { supabase, TABLES, saveOwnerToken, getOwnerToken, isSupabaseConfigured } from './supabase';

// ============================================
// DECK OPERATIONS
// ============================================

/**
 * Create a new deck
 * POST /api/decks
 *
 * @param {string} title - Optional deck title
 * @returns {Promise<{deck: Object, ownerToken: string}>}
 */
export async function createDeck(title = 'Untitled deck') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from(TABLES.DECKS)
    .insert({ title })
    .select()
    .single();

  if (error) {
    console.error('Error creating deck:', error);
    throw new Error('Failed to create deck');
  }

  // Save owner token to localStorage
  saveOwnerToken(data.id, data.owner_token);

  return {
    deck: {
      id: data.id,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    ownerToken: data.owner_token,
  };
}

/**
 * Get a deck by ID with all its cards
 * GET /api/decks/:id
 *
 * @param {string} deckId - Deck UUID
 * @returns {Promise<{deck: Object, cards: Array, isOwner: boolean}>}
 */
export async function getDeck(deckId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Fetch deck
  const { data: deckData, error: deckError } = await supabase
    .from(TABLES.DECKS)
    .select('*')
    .eq('id', deckId)
    .single();

  if (deckError) {
    console.error('Error fetching deck:', deckError);
    throw new Error('Deck not found');
  }

  // Fetch cards sorted by position
  const { data: cardsData, error: cardsError } = await supabase
    .from(TABLES.CARDS)
    .select('*')
    .eq('deck_id', deckId)
    .order('position', { ascending: true });

  if (cardsError) {
    console.error('Error fetching cards:', cardsError);
    throw new Error('Failed to fetch cards');
  }

  // Check if user owns this deck
  const storedToken = getOwnerToken(deckId);
  const userIsOwner = storedToken === deckData.owner_token;

  return {
    deck: {
      id: deckData.id,
      title: deckData.title,
      createdAt: deckData.created_at,
      updatedAt: deckData.updated_at,
    },
    cards: cardsData.map(transformCard),
    isOwner: userIsOwner,
  };
}

/**
 * Update deck title
 * PATCH /api/decks/:id
 *
 * @param {string} deckId - Deck UUID
 * @param {string} title - New title
 * @returns {Promise<Object>}
 */
export async function updateDeck(deckId, { title }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Verify ownership
  const { data: deckData } = await supabase
    .from(TABLES.DECKS)
    .select('owner_token')
    .eq('id', deckId)
    .single();

  const storedToken = getOwnerToken(deckId);
  if (!deckData || storedToken !== deckData.owner_token) {
    throw new Error('Unauthorized: You do not own this deck');
  }

  const { data, error } = await supabase
    .from(TABLES.DECKS)
    .update({ title })
    .eq('id', deckId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deck:', error);
    throw new Error('Failed to update deck');
  }

  return {
    id: data.id,
    title: data.title,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Fork a deck (create a copy with new owner)
 * Used when editing a shared deck
 *
 * @param {string} deckId - Original deck UUID
 * @returns {Promise<{deck: Object, ownerToken: string}>}
 */
export async function forkDeck(deckId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Get original deck and cards
  const { deck: originalDeck, cards: originalCards } = await getDeck(deckId);

  // Create new deck
  const { deck: newDeck, ownerToken } = await createDeck(
    `${originalDeck.title} (Copy)`
  );

  // Copy all cards to new deck
  if (originalCards.length > 0) {
    const cardsToInsert = originalCards.map((card) => ({
      deck_id: newDeck.id,
      title: card.title,
      body: card.body,
      category: card.category,
      characters: card.characters,
      position: card.position,
    }));

    const { error } = await supabase
      .from(TABLES.CARDS)
      .insert(cardsToInsert);

    if (error) {
      console.error('Error copying cards:', error);
      // Delete the new deck since we failed to copy cards
      await supabase.from(TABLES.DECKS).delete().eq('id', newDeck.id);
      throw new Error('Failed to fork deck');
    }
  }

  return { deck: newDeck, ownerToken };
}

// ============================================
// CARD OPERATIONS
// ============================================

/**
 * Add a card to a deck
 * POST /api/decks/:id/cards
 *
 * @param {string} deckId - Deck UUID
 * @param {Object} cardData - Card data (title, body, category, characters)
 * @returns {Promise<Object>}
 */
export async function addCard(deckId, cardData) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Get current max position
  const { data: existingCards } = await supabase
    .from(TABLES.CARDS)
    .select('position')
    .eq('deck_id', deckId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingCards?.length > 0
    ? existingCards[0].position + 1
    : 1;

  const { data, error } = await supabase
    .from(TABLES.CARDS)
    .insert({
      deck_id: deckId,
      title: cardData.title,
      body: cardData.body || '',
      category: cardData.category,
      characters: cardData.characters || [],
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding card:', error);
    throw new Error('Failed to add card');
  }

  return transformCard(data);
}

/**
 * Update a card
 * PATCH /api/cards/:id
 *
 * @param {string} cardId - Card UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateCard(cardId, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Build update object with only provided fields
  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.body !== undefined) updateData.body = updates.body;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.characters !== undefined) updateData.characters = updates.characters;
  if (updates.position !== undefined) updateData.position = updates.position;

  const { data, error } = await supabase
    .from(TABLES.CARDS)
    .update(updateData)
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw new Error('Failed to update card');
  }

  return transformCard(data);
}

/**
 * Delete a card
 * DELETE /api/cards/:id
 *
 * @param {string} cardId - Card UUID
 * @returns {Promise<void>}
 */
export async function deleteCard(cardId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from(TABLES.CARDS)
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error('Failed to delete card');
  }
}

/**
 * Reorder cards in a deck
 * POST /api/decks/:id/reorder
 *
 * @param {string} deckId - Deck UUID
 * @param {string[]} cardIds - Array of card IDs in new order
 * @returns {Promise<void>}
 */
export async function reorderCards(deckId, cardIds) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Update each card's position in a transaction-like manner
  const updates = cardIds.map((cardId, index) => ({
    id: cardId,
    position: index + 1,
  }));

  // Use Promise.all for parallel updates
  const results = await Promise.all(
    updates.map(({ id, position }) =>
      supabase
        .from(TABLES.CARDS)
        .update({ position })
        .eq('id', id)
        .eq('deck_id', deckId) // Ensure card belongs to this deck
    )
  );

  // Check for any errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('Error reordering cards:', errors);
    throw new Error('Failed to reorder cards');
  }
}

/**
 * Reindex card positions after deletion
 * Ensures positions are sequential (1, 2, 3, ...)
 *
 * @param {string} deckId - Deck UUID
 * @returns {Promise<void>}
 */
export async function reindexCardPositions(deckId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Get all cards sorted by current position
  const { data: cards, error: fetchError } = await supabase
    .from(TABLES.CARDS)
    .select('id')
    .eq('deck_id', deckId)
    .order('position', { ascending: true });

  if (fetchError) {
    console.error('Error fetching cards for reindex:', fetchError);
    throw new Error('Failed to reindex cards');
  }

  // Reorder with sequential positions
  if (cards && cards.length > 0) {
    await reorderCards(deckId, cards.map((c) => c.id));
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform database card row to app format
 */
function transformCard(row) {
  return {
    id: row.id,
    deckId: row.deck_id,
    title: row.title,
    body: row.body || '',
    category: row.category,
    characters: row.characters || [],
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Check if Supabase is available
 */
export function isApiAvailable() {
  return isSupabaseConfigured();
}

// ============================================
// AI OPERATIONS
// ============================================

/**
 * Generate AI summary for a deck
 * POST /api/decks/:id/summarize
 *
 * @param {string} deckId - Deck UUID
 * @returns {Promise<{summary: string, cardCount: number}>}
 */
export async function summarizeDeck(deckId) {
  const response = await fetch(`/api/decks/${deckId}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate summary');
  }

  return response.json();
}
