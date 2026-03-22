import { useState, useCallback, useMemo } from 'react';
import { summarizeDeck, isApiAvailable } from '../lib/api';

/**
 * Generate a hash of the deck state for caching
 * Only re-summarize if cards have changed
 */
function generateDeckHash(cards) {
  if (!cards || cards.length === 0) return 'empty';

  const content = cards
    .map((c) => `${c.id}:${c.position}:${c.title}:${c.body}:${c.category}`)
    .join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Hook for managing AI summary generation
 *
 * @param {string} deckId - Deck UUID
 * @param {Array} cards - Array of cards in the deck
 * @returns {Object} Summary state and actions
 */
export function useSummary(deckId, cards = []) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastHash, setLastHash] = useState(null);

  // Calculate current deck hash
  const currentHash = useMemo(() => generateDeckHash(cards), [cards]);

  // Check if deck has changed since last summary
  const hasChanges = lastHash !== null && lastHash !== currentHash;

  // Check if summary exists
  const hasSummary = summary !== null;

  // Extract unique characters from all cards with counts
  const characterIndex = useMemo(() => {
    const charMap = new Map();
    cards.forEach((card) => {
      card.characters?.forEach((char) => {
        const count = charMap.get(char) || 0;
        charMap.set(char, count + 1);
      });
    });
    return Array.from(charMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([name, count]) => ({ name, count }));
  }, [cards]);

  /**
   * Generate summary from API
   */
  const generateSummary = useCallback(async () => {
    if (!deckId || cards.length === 0) {
      setError('No cards to summarize');
      return false;
    }

    if (!isApiAvailable()) {
      setError('API not available. Please configure Supabase.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await summarizeDeck(deckId);
      setSummary(result.summary);
      setLastHash(currentHash);
      return true;
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(err.message || 'Failed to generate summary');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deckId, cards.length, currentHash]);

  /**
   * Clear the current summary
   */
  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
    setLastHash(null);
  }, []);

  return {
    // State
    summary,
    isLoading,
    error,
    hasChanges,
    hasSummary,
    characterIndex,
    cardCount: cards.length,

    // Actions
    generateSummary,
    clearSummary,
  };
}

export default useSummary;
