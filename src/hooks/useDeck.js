import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createDeck,
  getDeck,
  updateDeck as apiUpdateDeck,
  updateDeckColorLabels as apiUpdateColorLabels,
  reorderCards as apiReorderCards,
  forkDeck as apiForkDeck,
  getSavedVersions,
  isApiAvailable,
} from '../lib/api';
import useDeckStore from '../store/deckStore';

// Auto-save interval in milliseconds (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

/**
 * Hook for managing deck loading, creation, and persistence
 *
 * Handles:
 * - Parsing deck ID from URL
 * - Creating new deck if no ID
 * - Loading existing deck from API
 * - Updating URL when deck is created
 * - Color labels syncing
 * - Saved versions loading
 */
export function useDeck() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(true);

  // Store actions
  const setDeck = useDeckStore((state) => state.setDeck);
  const setCards = useDeckStore((state) => state.setCards);
  const setColorLabels = useDeckStore((state) => state.setColorLabels);
  const setSavedVersions = useDeckStore((state) => state.setSavedVersions);
  const deck = useDeckStore((state) => state.deck);
  const colorLabels = useDeckStore((state) => state.colorLabels);
  const saveStatus = useDeckStore((state) => state.saveStatus);
  const setSaveStatus = useDeckStore((state) => state.setSaveStatus);

  // Track if save is in progress
  const isSavingRef = useRef(false);

  /**
   * Get deck ID from URL hash
   * URL format: /#/deck/abc123 or just /#/abc123
   */
  const getDeckIdFromUrl = useCallback(() => {
    const hash = window.location.hash;
    if (!hash) return null;

    // Match /#/deck/ID or /#/ID
    const match = hash.match(/#\/?(?:deck\/)?([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }, []);

  /**
   * Update URL with deck ID
   */
  const setDeckIdInUrl = useCallback((deckId) => {
    window.history.replaceState(null, '', `#/deck/${deckId}`);
  }, []);

  /**
   * Initialize deck - load existing or create new
   */
  const initializeDeck = useCallback(async () => {
    // If Supabase is not configured, stay in local mode
    if (!isApiAvailable()) {
      console.log('Running in local mode (Supabase not configured)');
      setIsLoading(false);
      setIsOwner(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const deckId = getDeckIdFromUrl();

      if (deckId) {
        // Load existing deck
        const { deck: loadedDeck, cards, isOwner: ownerStatus } = await getDeck(deckId);

        setDeck({
          id: loadedDeck.id,
          title: loadedDeck.title,
          colorLabels: loadedDeck.colorLabels,
          createdAt: loadedDeck.createdAt,
          updatedAt: loadedDeck.updatedAt,
        });

        // Set color labels from deck
        if (loadedDeck.colorLabels) {
          setColorLabels(loadedDeck.colorLabels);
        }

        setCards(cards);
        setIsOwner(ownerStatus);

        // Load saved versions if owner
        if (ownerStatus) {
          try {
            const versions = await getSavedVersions(deckId);
            setSavedVersions(versions);
          } catch (err) {
            console.warn('Failed to load saved versions:', err);
          }
        }
      } else {
        // Create new deck
        const { deck: newDeck } = await createDeck();

        setDeck({
          id: newDeck.id,
          title: newDeck.title,
          colorLabels: newDeck.colorLabels,
          createdAt: newDeck.createdAt,
          updatedAt: newDeck.updatedAt,
        });

        // Set default color labels
        if (newDeck.colorLabels) {
          setColorLabels(newDeck.colorLabels);
        }

        // Clear sample cards for new deck
        setCards([]);

        // Update URL
        setDeckIdInUrl(newDeck.id);
        setIsOwner(true);
      }
    } catch (err) {
      console.error('Failed to initialize deck:', err);
      setError(err.message);

      // If deck not found, create a new one
      if (err.message === 'Deck not found') {
        try {
          const { deck: newDeck } = await createDeck();
          setDeck({
            id: newDeck.id,
            title: newDeck.title,
            colorLabels: newDeck.colorLabels,
            createdAt: newDeck.createdAt,
            updatedAt: newDeck.updatedAt,
          });
          if (newDeck.colorLabels) {
            setColorLabels(newDeck.colorLabels);
          }
          setCards([]);
          setDeckIdInUrl(newDeck.id);
          setIsOwner(true);
          setError(null);
        } catch (createErr) {
          setError(createErr.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [getDeckIdFromUrl, setDeckIdInUrl, setDeck, setCards, setColorLabels, setSavedVersions]);

  /**
   * Update deck title (with API sync)
   */
  const updateDeckTitle = useCallback(async (title) => {
    // Update store immediately (optimistic)
    setDeck({ title });

    // Sync to API if available and we're the owner
    if (isApiAvailable() && deck.id && isOwner) {
      try {
        await apiUpdateDeck(deck.id, { title });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to sync deck title:', err);
      }
    }
  }, [deck.id, isOwner, setDeck, setSaveStatus]);

  /**
   * Update color labels (with API sync)
   */
  const updateColorLabels = useCallback(async (newColorLabels) => {
    // Update store immediately (optimistic)
    setColorLabels(newColorLabels);

    // Sync to API if available and we're the owner
    if (isApiAvailable() && deck.id && isOwner) {
      try {
        await apiUpdateColorLabels(deck.id, newColorLabels);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to sync color labels:', err);
      }
    }
  }, [deck.id, isOwner, setColorLabels, setSaveStatus]);

  /**
   * Save all unsaved changes to API
   */
  const saveChanges = useCallback(async () => {
    if (!isApiAvailable() || !deck.id || !isOwner || isSavingRef.current) {
      return;
    }

    const currentSaveStatus = useDeckStore.getState().saveStatus;
    if (currentSaveStatus === 'saved') {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Save deck title
      const currentDeck = useDeckStore.getState().deck;
      await apiUpdateDeck(deck.id, { title: currentDeck.title });

      // Save color labels
      const currentColorLabels = useDeckStore.getState().colorLabels;
      await apiUpdateColorLabels(deck.id, currentColorLabels);

      // Save card order
      const currentCards = useDeckStore.getState().cards;
      const cardIds = currentCards.map((c) => c.id);
      if (cardIds.length > 0) {
        await apiReorderCards(deck.id, cardIds);
      }

      setSaveStatus('saved');
      console.log('Auto-save completed');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('unsaved');
    } finally {
      isSavingRef.current = false;
    }
  }, [deck.id, isOwner, setSaveStatus]);

  // Auto-save effect - runs every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!isApiAvailable() || !isOwner) {
      return;
    }

    const intervalId = setInterval(() => {
      const currentSaveStatus = useDeckStore.getState().saveStatus;
      if (currentSaveStatus === 'unsaved') {
        saveChanges();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isOwner, saveChanges]);

  /**
   * Fork the current deck (create a copy that the user owns)
   */
  const forkCurrentDeck = useCallback(async () => {
    if (!isApiAvailable() || !deck.id) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { deck: newDeck } = await apiForkDeck(deck.id);

      // Update store with forked deck
      setDeck({
        id: newDeck.id,
        title: newDeck.title,
        colorLabels: newDeck.colorLabels,
        createdAt: newDeck.createdAt,
        updatedAt: newDeck.updatedAt,
      });

      // Set color labels from forked deck
      if (newDeck.colorLabels) {
        setColorLabels(newDeck.colorLabels);
      }

      // Reload to get the forked cards
      const { cards: forkedCards } = await getDeck(newDeck.id);
      setCards(forkedCards);

      // Update URL to new deck
      setDeckIdInUrl(newDeck.id);
      setIsOwner(true);
      setSaveStatus('saved');

      return newDeck;
    } catch (err) {
      console.error('Failed to fork deck:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [deck.id, setDeck, setCards, setColorLabels, setDeckIdInUrl, setSaveStatus]);

  // Initialize on mount and when URL changes
  useEffect(() => {
    initializeDeck();

    // Listen for hash changes (back/forward navigation)
    const handleHashChange = () => {
      initializeDeck();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [initializeDeck]);

  return {
    isLoading,
    error,
    isOwner,
    deckId: deck.id,
    updateDeckTitle,
    updateColorLabels,
    reload: initializeDeck,
    saveStatus,
    saveChanges,
    forkDeck: forkCurrentDeck,
  };
}

export default useDeck;
