import { useCallback } from 'react';
import {
  addCard as apiAddCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  reorderCards as apiReorderCards,
  isApiAvailable,
} from '../lib/api';
import useDeckStore from '../store/deckStore';

/**
 * Hook for managing card operations with API persistence
 *
 * Provides optimistic updates:
 * 1. Update local store immediately (marks as unsaved)
 * 2. Sync to API in background
 * 3. Mark as saved on success, rollback on error
 */
export function useCards() {
  const deck = useDeckStore((state) => state.deck);
  const cards = useDeckStore((state) => state.cards);

  // Store actions
  const storeAddCard = useDeckStore((state) => state.addCard);
  const storeUpdateCard = useDeckStore((state) => state.updateCard);
  const storeDeleteCard = useDeckStore((state) => state.deleteCard);
  const storeReorderCards = useDeckStore((state) => state.reorderCards);
  const storeShuffleCards = useDeckStore((state) => state.shuffleCards);
  const storeUndoReorder = useDeckStore((state) => state.undoReorder);
  const setIsShuffling = useDeckStore((state) => state.setIsShuffling);
  const setCards = useDeckStore((state) => state.setCards);
  const setSaveStatus = useDeckStore((state) => state.setSaveStatus);

  /**
   * Add a new card with API sync
   */
  const addCard = useCallback(async (cardData) => {
    // Optimistic update - add to store immediately (marks as unsaved)
    storeAddCard(cardData);

    // Sync to API if available
    if (isApiAvailable() && deck.id) {
      try {
        const savedCard = await apiAddCard(deck.id, cardData);
        setSaveStatus('saved');
        console.log('Card saved to API:', savedCard.id);
      } catch (err) {
        console.error('Failed to sync card to API:', err);
        // Keep as unsaved so auto-save can retry
      }
    }
  }, [deck.id, storeAddCard, setSaveStatus]);

  /**
   * Update a card with API sync
   */
  const updateCard = useCallback(async (cardId, updates) => {
    // Optimistic update (marks as unsaved)
    storeUpdateCard(cardId, updates);

    // Sync to API if available
    if (isApiAvailable()) {
      try {
        await apiUpdateCard(cardId, updates);
        setSaveStatus('saved');
        console.log('Card updated in API:', cardId);
      } catch (err) {
        console.error('Failed to sync card update to API:', err);
        // Keep as unsaved so auto-save can retry
      }
    }
  }, [storeUpdateCard, setSaveStatus]);

  /**
   * Delete a card with API sync
   */
  const deleteCard = useCallback(async (cardId) => {
    // Store the card for potential rollback
    const cardToDelete = cards.find((c) => c.id === cardId);

    // Optimistic update (marks as unsaved)
    storeDeleteCard(cardId);

    // Sync to API if available
    if (isApiAvailable()) {
      try {
        await apiDeleteCard(cardId);
        setSaveStatus('saved');
        console.log('Card deleted from API:', cardId);
      } catch (err) {
        console.error('Failed to sync card deletion to API:', err);
        // Rollback: re-add the card
        if (cardToDelete) {
          storeAddCard(cardToDelete);
        }
      }
    }
  }, [cards, storeDeleteCard, storeAddCard, setSaveStatus]);

  /**
   * Reorder cards with API sync
   */
  const reorderCards = useCallback(async (oldIndex, newIndex) => {
    // Optimistic update (marks as unsaved)
    storeReorderCards(oldIndex, newIndex);

    // Get the new order of card IDs
    const reorderedCards = useDeckStore.getState().cards;
    const cardIds = reorderedCards.map((c) => c.id);

    // Sync to API if available
    if (isApiAvailable() && deck.id) {
      try {
        await apiReorderCards(deck.id, cardIds);
        setSaveStatus('saved');
        console.log('Cards reordered in API');
      } catch (err) {
        console.error('Failed to sync card reorder to API:', err);
        // Keep as unsaved so auto-save can retry
      }
    }
  }, [deck.id, storeReorderCards, setSaveStatus]);

  /**
   * Shuffle cards with animation and API sync
   */
  const shuffleCards = useCallback(async () => {
    // Trigger shuffle with animation state
    storeShuffleCards();

    // Wait for scatter animation (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    // End shuffling animation
    setIsShuffling(false);

    // Get the new order of card IDs
    const shuffledCards = useDeckStore.getState().cards;
    const cardIds = shuffledCards.map((c) => c.id);

    // Sync to API if available
    if (isApiAvailable() && deck.id) {
      try {
        await apiReorderCards(deck.id, cardIds);
        setSaveStatus('saved');
        console.log('Shuffled cards synced to API');
      } catch (err) {
        console.error('Failed to sync shuffle to API:', err);
        // Keep as unsaved so auto-save can retry
      }
    }
  }, [deck.id, storeShuffleCards, setIsShuffling, setSaveStatus]);

  /**
   * Undo the last reorder (drag-drop or shuffle)
   */
  const undoReorder = useCallback(async () => {
    storeUndoReorder();

    // Get the restored order of card IDs
    const restoredCards = useDeckStore.getState().cards;
    const cardIds = restoredCards.map((c) => c.id);

    // Sync to API if available
    if (isApiAvailable() && deck.id) {
      try {
        await apiReorderCards(deck.id, cardIds);
        setSaveStatus('saved');
        console.log('Undo reorder synced to API');
      } catch (err) {
        console.error('Failed to sync undo to API:', err);
      }
    }
  }, [deck.id, storeUndoReorder, setSaveStatus]);

  return {
    addCard,
    updateCard,
    deleteCard,
    reorderCards,
    shuffleCards,
    undoReorder,
  };
}

export default useCards;
