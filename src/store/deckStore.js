import { create } from 'zustand';
import { CATEGORIES, DEFAULT_DECK_TITLE } from '../lib/constants';

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sample cards for initial state
const sampleCards = [
  {
    id: '1',
    title: 'Opening Image',
    body: 'We meet Elena walking through the dead orchard at dawn. The trees are bare, the ground cracked.',
    category: CATEGORIES.PLOT,
    characters: ['Elena'],
    position: 1,
  },
  {
    id: '2',
    title: "Elena's Secret",
    body: 'Elena has been hiding letters from her grandmother, who died twenty years ago.',
    category: CATEGORIES.CHARACTER,
    characters: ['Elena', 'Grandmother'],
    position: 2,
  },
  {
    id: '3',
    title: 'The Abandoned Mill',
    body: "An old flour mill at the edge of the property. Locals say it's haunted.",
    category: CATEGORIES.WORLD,
    characters: [],
    position: 3,
  },
  {
    id: '4',
    title: 'Memory vs Reality',
    body: 'The story explores how we reshape our memories to protect ourselves from painful truths.',
    category: CATEGORIES.THEME,
    characters: [],
    position: 4,
  },
  {
    id: '5',
    title: 'The Letters Are Forgeries',
    body: 'Elena discovers the letters were written by her mother, not her grandmother.',
    category: CATEGORIES.TWIST,
    characters: ['Elena', 'Mother'],
    position: 5,
  },
  {
    id: '6',
    title: 'Confrontation at the Mill',
    body: 'Elena confronts her mother in the abandoned mill. Rain pours through the broken roof.',
    category: CATEGORIES.SCENE,
    characters: ['Elena', 'Mother'],
    position: 6,
  },
];

/**
 * Zustand store for deck and card state management
 */
const useDeckStore = create((set, get) => ({
  // ============ DECK STATE ============
  deck: {
    id: null,
    title: DEFAULT_DECK_TITLE,
    ownerToken: null,
    createdAt: null,
    updatedAt: null,
  },

  // ============ CARDS STATE ============
  cards: sampleCards,

  // ============ UI STATE ============
  ui: {
    activeFilter: 'all',
    characterFilter: null, // null means "all characters"
    searchQuery: '',
    editingCardId: null,
    sidebarTab: 'form',
    isSidebarOpen: true,
  },

  // ============ SAVE STATE ============
  // 'saved' | 'saving' | 'unsaved'
  saveStatus: 'saved',
  lastSavedAt: null,

  // ============ REORDER HISTORY ============
  // Store last 5 card orders for undo (works for both drag-drop and shuffle)
  reorderHistory: [],
  isShuffling: false,

  // ============ DECK ACTIONS ============
  setDeckTitle: (title) =>
    set((state) => ({
      deck: { ...state.deck, title: title || DEFAULT_DECK_TITLE },
      saveStatus: 'unsaved',
    })),

  setDeck: (deckData) =>
    set((state) => ({
      deck: { ...state.deck, ...deckData },
    })),

  // ============ CARD ACTIONS ============
  addCard: (cardData) =>
    set((state) => {
      const newCard = {
        ...cardData,
        id: generateId(),
        position: state.cards.length + 1,
      };
      return {
        cards: [...state.cards, newCard],
        saveStatus: 'unsaved',
      };
    }),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
      saveStatus: 'unsaved',
    })),

  deleteCard: (id) =>
    set((state) => {
      const filtered = state.cards.filter((card) => card.id !== id);
      // Update positions after deletion
      const reindexed = filtered.map((card, index) => ({
        ...card,
        position: index + 1,
      }));

      // Clear editing state if deleting the card being edited
      const newEditingCardId =
        state.ui.editingCardId === id ? null : state.ui.editingCardId;

      return {
        cards: reindexed,
        ui: { ...state.ui, editingCardId: newEditingCardId },
        saveStatus: 'unsaved',
      };
    }),

  reorderCards: (oldIndex, newIndex) =>
    set((state) => {
      const filteredCards = get().getFilteredCards();
      const draggedCardId = filteredCards[oldIndex]?.id;
      const targetCardId = filteredCards[newIndex]?.id;

      if (!draggedCardId || !targetCardId) return state;

      // Save current order to history (keep last 5)
      const newHistory = [
        [...state.cards],
        ...state.reorderHistory.slice(0, 4),
      ];

      const newCards = [...state.cards];
      const draggedIdx = newCards.findIndex((c) => c.id === draggedCardId);
      const targetIdx = newCards.findIndex((c) => c.id === targetCardId);

      const [movedCard] = newCards.splice(draggedIdx, 1);
      newCards.splice(targetIdx, 0, movedCard);

      // Update position numbers
      const reindexed = newCards.map((card, index) => ({
        ...card,
        position: index + 1,
      }));

      return {
        cards: reindexed,
        reorderHistory: newHistory,
        saveStatus: 'unsaved',
      };
    }),

  shuffleCards: () =>
    set((state) => {
      // Save current order to history (keep last 5)
      const newHistory = [
        [...state.cards],
        ...state.reorderHistory.slice(0, 4),
      ];

      // Get current filter
      const { activeFilter, characterFilter, searchQuery } = state.ui;
      const hasFilter = activeFilter !== 'all' || characterFilter || searchQuery;

      let newCards;

      if (hasFilter) {
        // Only shuffle visible (filtered) cards
        const filteredIds = new Set(
          state.cards
            .filter((card) => {
              if (activeFilter !== 'all' && card.category !== activeFilter) return false;
              if (characterFilter && !card.characters?.includes(characterFilter)) return false;
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = card.title.toLowerCase().includes(query);
                const matchesBody = card.body?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesBody) return false;
              }
              return true;
            })
            .map((c) => c.id)
        );

        // Separate filtered and non-filtered cards
        const filteredCards = state.cards.filter((c) => filteredIds.has(c.id));
        const otherCards = state.cards.filter((c) => !filteredIds.has(c.id));

        // Shuffle only the filtered cards
        const shuffledFiltered = [...filteredCards].sort(() => Math.random() - 0.5);

        // Reconstruct: place shuffled cards in their original filtered positions
        newCards = [];
        let filteredIndex = 0;
        let otherIndex = 0;

        state.cards.forEach((card) => {
          if (filteredIds.has(card.id)) {
            newCards.push(shuffledFiltered[filteredIndex++]);
          } else {
            newCards.push(otherCards[otherIndex++]);
          }
        });
      } else {
        // Shuffle all cards
        newCards = [...state.cards].sort(() => Math.random() - 0.5);
      }

      // Reindex positions
      const reindexed = newCards.map((card, index) => ({
        ...card,
        position: index + 1,
      }));

      return {
        cards: reindexed,
        reorderHistory: newHistory,
        isShuffling: true,
        saveStatus: 'unsaved',
      };
    }),

  // Set shuffling state (for animation)
  setIsShuffling: (isShuffling) =>
    set(() => ({ isShuffling })),

  // Undo last reorder (works for both drag-drop and shuffle)
  undoReorder: () =>
    set((state) => {
      if (state.reorderHistory.length === 0) return state;

      const [previousCards, ...remainingHistory] = state.reorderHistory;

      return {
        cards: previousCards,
        reorderHistory: remainingHistory,
        saveStatus: 'unsaved',
      };
    }),

  // Check if undo is available
  canUndoReorder: () => {
    return get().reorderHistory.length > 0;
  },

  setCards: (cards) =>
    set(() => ({
      cards: cards.map((card, index) => ({
        ...card,
        position: index + 1,
      })),
    })),

  // ============ UI ACTIONS ============
  setFilter: (filter) =>
    set((state) => ({
      ui: { ...state.ui, activeFilter: filter },
    })),

  setCharacterFilter: (character) =>
    set((state) => ({
      ui: { ...state.ui, characterFilter: character },
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      ui: { ...state.ui, searchQuery: query },
    })),

  setEditingCard: (cardId) =>
    set((state) => ({
      ui: {
        ...state.ui,
        editingCardId: cardId,
        sidebarTab: cardId !== null ? 'form' : state.ui.sidebarTab,
      },
    })),

  clearEditingCard: () =>
    set((state) => ({
      ui: { ...state.ui, editingCardId: null },
    })),

  setSidebarTab: (tab) =>
    set((state) => ({
      ui: { ...state.ui, sidebarTab: tab },
    })),

  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen },
    })),

  // ============ SAVE STATE ACTIONS ============
  setSaveStatus: (status) =>
    set(() => ({
      saveStatus: status,
      ...(status === 'saved' ? { lastSavedAt: new Date().toISOString() } : {}),
    })),

  markUnsaved: () =>
    set((state) => ({
      saveStatus: state.saveStatus === 'saving' ? 'saving' : 'unsaved',
    })),

  // ============ COMPUTED / SELECTORS ============
  getFilteredCards: () => {
    const { cards, ui } = get();
    const { activeFilter, characterFilter, searchQuery } = ui;

    return cards.filter((card) => {
      // Category filter
      if (activeFilter !== 'all' && card.category !== activeFilter) {
        return false;
      }

      // Character filter
      if (characterFilter && !card.characters?.includes(characterFilter)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesBody = card.body?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBody) {
          return false;
        }
      }

      return true;
    });
  },

  getEditingCard: () => {
    const { cards, ui } = get();
    if (!ui.editingCardId) return null;
    return cards.find((card) => card.id === ui.editingCardId) || null;
  },

  getCardById: (id) => {
    const { cards } = get();
    return cards.find((card) => card.id === id) || null;
  },

  getAllCharacters: () => {
    const { cards } = get();
    const characterSet = new Set();
    cards.forEach((card) => {
      card.characters?.forEach((char) => characterSet.add(char));
    });
    return Array.from(characterSet).sort();
  },
}));

export default useDeckStore;
