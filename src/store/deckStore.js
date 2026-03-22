import { create } from 'zustand';
import {
  CARD_TYPES,
  CARD_COLORS,
  DEFAULT_COLOR_LABELS,
  DEFAULT_DECK_TITLE,
  VIEW_MODES,
} from '../lib/constants';

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sample cards for initial state (using new data model)
const sampleCards = [
  {
    id: '1',
    type: CARD_TYPES.STORY,
    title: 'Opening Image',
    frontText: 'We meet Elena walking through the dead orchard at dawn. The trees are bare, the ground cracked.',
    backText: 'Visual motif: contrast between life and death, hope and despair.',
    color: CARD_COLORS.ORANGE,
    tags: ['Setup'],
    linkedCharacterIds: ['char1'],
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: CARD_TYPES.STORY,
    title: 'The Letters Are Forgeries',
    frontText: 'Elena discovers the letters were written by her mother, not her grandmother.',
    backText: 'This is the central twist. Foreshadowed by the handwriting inconsistencies.',
    color: CARD_COLORS.RED,
    tags: ['Twist', 'Reveal'],
    linkedCharacterIds: ['char1', 'char2'],
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: CARD_TYPES.STORY,
    title: 'Confrontation at the Mill',
    frontText: 'Elena confronts her mother in the abandoned mill. Rain pours through the broken roof.',
    backText: 'Climactic scene. Mother finally reveals the truth about grandmother.',
    color: CARD_COLORS.RED,
    tags: ['Climax', 'Conflict'],
    linkedCharacterIds: ['char1', 'char2'],
    position: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: CARD_TYPES.STORY,
    title: 'The Abandoned Mill',
    frontText: "An old flour mill at the edge of the property. Locals say it's haunted.",
    backText: 'Key location. Represents the family secrets hidden away.',
    color: CARD_COLORS.GREEN,
    tags: ['Setup'],
    linkedCharacterIds: [],
    position: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: CARD_TYPES.STORY,
    title: 'Memory vs Reality',
    frontText: 'The story explores how we reshape our memories to protect ourselves from painful truths.',
    backText: 'Core thematic thread. Returns in the final scene.',
    color: CARD_COLORS.PURPLE,
    tags: ['Theme'],
    linkedCharacterIds: [],
    position: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'char1',
    type: CARD_TYPES.CHARACTER,
    title: 'Elena',
    frontText: 'Protagonist. A woman in her 30s returning to her childhood home after years away.',
    backText: 'Wants: To understand her past. Fears: What she might discover. Secret: She remembers more than she admits.',
    color: CARD_COLORS.TEAL,
    tags: [],
    linkedCharacterIds: [],
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'char2',
    type: CARD_TYPES.CHARACTER,
    title: 'Mother (Margaret)',
    frontText: 'Antagonist. Kept the truth from Elena for decades.',
    backText: 'Motivation: Protecting Elena from pain. Flaw: Believes lies can heal.',
    color: CARD_COLORS.PINK,
    tags: [],
    linkedCharacterIds: [],
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Zustand store for deck and card state management
 * Updated for tactile card UX redesign
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

  // ============ COLOR LABELS ============
  // User-customizable labels for each color
  colorLabels: { ...DEFAULT_COLOR_LABELS },

  // ============ SAVED VERSIONS ============
  savedVersions: [],
  activeVersionId: null, // null = live deck

  // ============ UI STATE ============
  ui: {
    // Tab: 'story' or 'characters'
    activeTab: 'story',

    // View mode: how cards are sorted/grouped
    viewMode: VIEW_MODES.MANUAL,
    selectedTags: [], // For tag filtering in 'tags' view mode

    // Legacy filters (kept for backwards compatibility during transition)
    activeFilter: 'all',
    characterFilter: null,
    searchQuery: '',

    // Composer state
    composerOpen: false,
    composerCardId: null, // null = new card, string = editing existing
    composerSide: 'front', // 'front' or 'back'

    // Peeking card visibility
    peekingCardVisible: true,

    // Last added card (for placement animation)
    lastAddedCardId: null,

    // Legacy sidebar state (kept for transition)
    editingCardId: null,
    sidebarTab: 'form',
    isSidebarOpen: true,

    // Modals
    summaryModalOpen: false,
    versionsPanelOpen: false,
    settingsModalOpen: false,
  },

  // ============ SAVE STATE ============
  saveStatus: 'saved',
  lastSavedAt: null,

  // ============ REORDER HISTORY ============
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
      colorLabels: deckData.colorLabels || state.colorLabels,
    })),

  // ============ COLOR LABEL ACTIONS ============
  updateColorLabel: (color, label) =>
    set((state) => ({
      colorLabels: { ...state.colorLabels, [color]: label },
      saveStatus: 'unsaved',
    })),

  setColorLabels: (labels) =>
    set(() => ({
      colorLabels: { ...DEFAULT_COLOR_LABELS, ...labels },
    })),

  // ============ CARD ACTIONS ============
  addCard: (cardData) =>
    set((state) => {
      const cardType = cardData.type || CARD_TYPES.STORY;
      // Get max position for this card type
      const cardsOfType = state.cards.filter((c) => c.type === cardType);
      const maxPosition = cardsOfType.length > 0
        ? Math.max(...cardsOfType.map((c) => c.position))
        : 0;

      const newCard = {
        id: generateId(),
        type: cardType,
        title: cardData.title || '',
        frontText: cardData.frontText || '',
        backText: cardData.backText || '',
        color: cardData.color || CARD_COLORS.GRAY,
        tags: cardData.tags || [],
        linkedCharacterIds: cardData.linkedCharacterIds || [],
        position: maxPosition + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Legacy fields
        body: cardData.frontText || cardData.body || '',
        category: cardData.category || 'plot',
        characters: cardData.characters || [],
      };

      return {
        cards: [...state.cards, newCard],
        saveStatus: 'unsaved',
        ui: { ...state.ui, lastAddedCardId: newCard.id },
      };
    }),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id
          ? {
              ...card,
              ...updates,
              // Keep frontText and body in sync
              frontText: updates.frontText ?? updates.body ?? card.frontText,
              body: updates.body ?? updates.frontText ?? card.body,
              updatedAt: new Date().toISOString(),
            }
          : card
      ),
      saveStatus: 'unsaved',
    })),

  deleteCard: (id) =>
    set((state) => {
      const cardToDelete = state.cards.find((c) => c.id === id);
      const filtered = state.cards.filter((card) => card.id !== id);

      // Update positions for cards of same type after deletion
      const reindexed = filtered.map((card) => {
        if (cardToDelete && card.type === cardToDelete.type && card.position > cardToDelete.position) {
          return { ...card, position: card.position - 1 };
        }
        return card;
      });

      // Clear editing state if deleting the card being edited
      const newComposerCardId =
        state.ui.composerCardId === id ? null : state.ui.composerCardId;
      const newEditingCardId =
        state.ui.editingCardId === id ? null : state.ui.editingCardId;

      return {
        cards: reindexed,
        ui: {
          ...state.ui,
          composerCardId: newComposerCardId,
          composerOpen: newComposerCardId === null && state.ui.composerOpen ? false : state.ui.composerOpen,
          editingCardId: newEditingCardId,
        },
        saveStatus: 'unsaved',
      };
    }),

  reorderCards: (oldIndex, newIndex) =>
    set((state) => {
      const filteredCards = get().getCardsByTab();
      const draggedCardId = filteredCards[oldIndex]?.id;
      const targetCardId = filteredCards[newIndex]?.id;

      if (!draggedCardId || !targetCardId) return state;

      // Save current order to history (keep last 5)
      const newHistory = [
        [...state.cards],
        ...state.reorderHistory.slice(0, 4),
      ];

      // Get cards of the active tab type
      const activeType = state.ui.activeTab === 'characters' ? CARD_TYPES.CHARACTER : CARD_TYPES.STORY;
      const tabCards = state.cards.filter((c) => c.type === activeType);
      const otherCards = state.cards.filter((c) => c.type !== activeType);

      // Reorder within tab cards
      const draggedIdx = tabCards.findIndex((c) => c.id === draggedCardId);
      const targetIdx = tabCards.findIndex((c) => c.id === targetCardId);

      const newTabCards = [...tabCards];
      const [movedCard] = newTabCards.splice(draggedIdx, 1);
      newTabCards.splice(targetIdx, 0, movedCard);

      // Reindex positions for tab cards
      const reindexedTabCards = newTabCards.map((card, index) => ({
        ...card,
        position: index + 1,
      }));

      return {
        cards: [...reindexedTabCards, ...otherCards],
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

      // Get active tab type
      const activeType = state.ui.activeTab === 'characters' ? CARD_TYPES.CHARACTER : CARD_TYPES.STORY;
      const tabCards = state.cards.filter((c) => c.type === activeType);
      const otherCards = state.cards.filter((c) => c.type !== activeType);

      // Shuffle only the active tab's cards
      const shuffledTabCards = [...tabCards].sort(() => Math.random() - 0.5);

      // Reindex positions
      const reindexedTabCards = shuffledTabCards.map((card, index) => ({
        ...card,
        position: index + 1,
      }));

      return {
        cards: [...reindexedTabCards, ...otherCards],
        reorderHistory: newHistory,
        isShuffling: true,
        saveStatus: 'unsaved',
      };
    }),

  setIsShuffling: (isShuffling) =>
    set(() => ({ isShuffling })),

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

  canUndoReorder: () => {
    return get().reorderHistory.length > 0;
  },

  setCards: (cards) =>
    set(() => ({
      cards: cards.map((card, index) => ({
        ...card,
        position: card.position ?? index + 1,
      })),
    })),

  // ============ TAB ACTIONS ============
  setActiveTab: (tab) =>
    set((state) => ({
      ui: { ...state.ui, activeTab: tab },
    })),

  // ============ VIEW MODE ACTIONS ============
  setViewMode: (mode) =>
    set((state) => ({
      ui: { ...state.ui, viewMode: mode },
    })),

  setSelectedTags: (tags) =>
    set((state) => ({
      ui: { ...state.ui, selectedTags: tags },
    })),

  // ============ COMPOSER ACTIONS ============
  openComposer: (cardId = null, side = 'front') =>
    set((state) => ({
      ui: {
        ...state.ui,
        composerOpen: true,
        composerCardId: cardId,
        composerSide: side,
      },
    })),

  closeComposer: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        composerOpen: false,
        composerCardId: null,
        composerSide: 'front',
      },
    })),

  flipComposer: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        composerSide: state.ui.composerSide === 'front' ? 'back' : 'front',
      },
    })),

  setComposerSide: (side) =>
    set((state) => ({
      ui: { ...state.ui, composerSide: side },
    })),

  // ============ PEEKING CARD ACTIONS ============
  togglePeekingCard: () =>
    set((state) => ({
      ui: { ...state.ui, peekingCardVisible: !state.ui.peekingCardVisible },
    })),

  setPeekingCardVisible: (visible) =>
    set((state) => ({
      ui: { ...state.ui, peekingCardVisible: visible },
    })),

  // Clear last added card ID (after animation completes)
  clearLastAddedCard: () =>
    set((state) => ({
      ui: { ...state.ui, lastAddedCardId: null },
    })),

  // ============ SAVED VERSIONS ACTIONS ============
  setSavedVersions: (versions) =>
    set(() => ({ savedVersions: versions })),

  addSavedVersion: (version) =>
    set((state) => ({
      savedVersions: [version, ...state.savedVersions],
    })),

  removeSavedVersion: (versionId) =>
    set((state) => ({
      savedVersions: state.savedVersions.filter((v) => v.id !== versionId),
      activeVersionId: state.activeVersionId === versionId ? null : state.activeVersionId,
    })),

  setActiveVersionId: (versionId) =>
    set(() => ({ activeVersionId: versionId })),

  // ============ MODAL ACTIONS ============
  toggleSummaryModal: () =>
    set((state) => ({
      ui: { ...state.ui, summaryModalOpen: !state.ui.summaryModalOpen },
    })),

  toggleVersionsPanel: () =>
    set((state) => ({
      ui: { ...state.ui, versionsPanelOpen: !state.ui.versionsPanelOpen },
    })),

  toggleSettingsModal: () =>
    set((state) => ({
      ui: { ...state.ui, settingsModalOpen: !state.ui.settingsModalOpen },
    })),

  // ============ LEGACY UI ACTIONS (for transition) ============
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
        // Also open composer for editing
        composerOpen: cardId !== null,
        composerCardId: cardId,
        composerSide: 'front',
      },
    })),

  clearEditingCard: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        editingCardId: null,
        composerOpen: false,
        composerCardId: null,
      },
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

  // Get cards for the active tab (story or characters)
  getCardsByTab: () => {
    const { cards, ui } = get();
    const targetType = ui.activeTab === 'characters' ? CARD_TYPES.CHARACTER : CARD_TYPES.STORY;
    return cards
      .filter((card) => card.type === targetType)
      .sort((a, b) => a.position - b.position);
  },

  // Get cards sorted/grouped by view mode
  getCardsByViewMode: () => {
    const { ui } = get();
    const tabCards = get().getCardsByTab();

    switch (ui.viewMode) {
      case VIEW_MODES.CREATED:
        return [...tabCards].sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );

      case VIEW_MODES.COLOR:
        return [...tabCards].sort((a, b) => {
          if (a.color !== b.color) {
            return a.color.localeCompare(b.color);
          }
          return a.position - b.position;
        });

      case VIEW_MODES.TAGS:
        if (ui.selectedTags.length === 0) {
          return tabCards;
        }
        return tabCards.filter((card) =>
          card.tags?.some((tag) => ui.selectedTags.includes(tag))
        );

      case VIEW_MODES.MANUAL:
      default:
        return tabCards;
    }
  },

  // Get cards for a specific saved version
  getCardsForVersion: (versionId) => {
    const { cards, savedVersions } = get();
    const version = savedVersions.find((v) => v.id === versionId);
    if (!version) return cards;

    // Apply version positions
    const positionMap = new Map(
      version.cardPositions.map((p) => [p.cardId, p.position])
    );

    return cards
      .filter((card) => version.cardIdsAtSave.includes(card.id))
      .map((card) => ({
        ...card,
        position: positionMap.get(card.id) ?? card.position,
      }))
      .sort((a, b) => a.position - b.position);
  },

  // Get cards added since a version was saved
  getNewCardsSinceVersion: (versionId) => {
    const { cards, savedVersions } = get();
    const version = savedVersions.find((v) => v.id === versionId);
    if (!version) return [];

    return cards.filter((card) => !version.cardIdsAtSave.includes(card.id));
  },

  // Get story cards only
  getStoryCards: () => {
    const { cards } = get();
    return cards
      .filter((card) => card.type === CARD_TYPES.STORY)
      .sort((a, b) => a.position - b.position);
  },

  // Get character cards only
  getCharacterCards: () => {
    const { cards } = get();
    return cards
      .filter((card) => card.type === CARD_TYPES.CHARACTER)
      .sort((a, b) => a.position - b.position);
  },

  // Legacy filter (kept for backwards compatibility)
  getFilteredCards: () => {
    const { cards, ui } = get();
    const { activeFilter, characterFilter, searchQuery } = ui;

    return cards.filter((card) => {
      // Only show story cards in filtered view (legacy behavior)
      if (card.type === CARD_TYPES.CHARACTER) {
        return false;
      }

      // Category filter (legacy)
      if (activeFilter !== 'all' && card.category !== activeFilter) {
        return false;
      }

      // Character filter (legacy)
      if (characterFilter && !card.characters?.includes(characterFilter)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesBody = (card.body || card.frontText || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesBody) {
          return false;
        }
      }

      return true;
    });
  },

  getEditingCard: () => {
    const { cards, ui } = get();
    const cardId = ui.composerCardId || ui.editingCardId;
    if (!cardId) return null;
    return cards.find((card) => card.id === cardId) || null;
  },

  getCardById: (id) => {
    const { cards } = get();
    return cards.find((card) => card.id === id) || null;
  },

  // Get all unique characters from character cards
  getAllCharacters: () => {
    const characterCards = get().getCharacterCards();
    return characterCards.map((card) => ({
      id: card.id,
      name: card.title,
    }));
  },

  // Get all unique tags from story cards
  getAllTags: () => {
    const storyCards = get().getStoryCards();
    const tagSet = new Set();
    storyCards.forEach((card) => {
      card.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Get character card by ID
  getCharacterById: (id) => {
    const { cards } = get();
    return cards.find((card) => card.id === id && card.type === CARD_TYPES.CHARACTER) || null;
  },
}));

export default useDeckStore;
