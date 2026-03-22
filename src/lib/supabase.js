import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in local-only mode. ' +
    'To enable persistence, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

/**
 * Supabase client instance
 * Will be null if credentials are not configured
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

/**
 * Database table names
 */
export const TABLES = {
  DECKS: 'decks',
  CARDS: 'cards',
  SAVED_VERSIONS: 'saved_versions',
};

/**
 * Owner token key for localStorage
 */
export const OWNER_TOKEN_KEY = 'storycards_owner_tokens';

/**
 * Get owner tokens from localStorage
 * Returns object mapping deck_id -> owner_token
 */
export const getOwnerTokens = () => {
  try {
    const tokens = localStorage.getItem(OWNER_TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : {};
  } catch {
    return {};
  }
};

/**
 * Save owner token for a deck
 */
export const saveOwnerToken = (deckId, token) => {
  try {
    const tokens = getOwnerTokens();
    tokens[deckId] = token;
    localStorage.setItem(OWNER_TOKEN_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to save owner token:', error);
  }
};

/**
 * Get owner token for a specific deck
 */
export const getOwnerToken = (deckId) => {
  const tokens = getOwnerTokens();
  return tokens[deckId] || null;
};

/**
 * Check if user owns a deck
 */
export const isOwner = (deckId, deckOwnerToken) => {
  const storedToken = getOwnerToken(deckId);
  return storedToken && storedToken === deckOwnerToken;
};
