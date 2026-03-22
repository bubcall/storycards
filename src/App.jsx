import { useEffect, useCallback, useState } from 'react';
import TopBar from './components/TopBar';
import Workspace from './components/Workspace';
import Onboarding from './components/Onboarding';
import CardComposer from './components/CardComposer';
import PeekingCard from './components/PeekingCard';
import SettingsModal from './components/SettingsModal';
import useDeckStore from './store/deckStore';
import useDeck from './hooks/useDeck';
import useCards from './hooks/useCards';
import { CARD_TYPES } from './lib/constants';

function App() {
  // Deck loading and persistence
  const { isLoading, error, isOwner, updateDeckTitle, updateColorLabels, saveStatus, forkDeck } = useDeck();

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Card operations with API sync
  const { addCard, updateCard, deleteCard, reorderCards, shuffleCards, undoReorder } = useCards();

  // Reorder history for undo
  const canUndoReorder = useDeckStore((state) => state.reorderHistory.length > 0);

  // Deck state from store
  const deck = useDeckStore((state) => state.deck);
  const cards = useDeckStore((state) => state.cards);
  const colorLabels = useDeckStore((state) => state.colorLabels);

  // UI state from store
  const ui = useDeckStore((state) => state.ui);
  const setActiveTab = useDeckStore((state) => state.setActiveTab);
  const setViewMode = useDeckStore((state) => state.setViewMode);
  const openComposer = useDeckStore((state) => state.openComposer);
  const closeComposer = useDeckStore((state) => state.closeComposer);
  const flipComposer = useDeckStore((state) => state.flipComposer);
  const togglePeekingCard = useDeckStore((state) => state.togglePeekingCard);

  // Legacy UI state (kept for transition)
  const setFilter = useDeckStore((state) => state.setFilter);
  const setCharacterFilter = useDeckStore((state) => state.setCharacterFilter);
  const setSearchQuery = useDeckStore((state) => state.setSearchQuery);
  const getAllCharacters = useDeckStore((state) => state.getAllCharacters);
  const setEditingCard = useDeckStore((state) => state.setEditingCard);
  const clearEditingCard = useDeckStore((state) => state.clearEditingCard);

  // Selectors
  const getEditingCard = useDeckStore((state) => state.getEditingCard);
  const getStoryCards = useDeckStore((state) => state.getStoryCards);

  const editingCard = getEditingCard();

  // Handlers
  const handleNewCard = useCallback(() => {
    openComposer(null, 'front');
  }, [openComposer]);

  const handleEdit = useCallback((cardId) => {
    if (!isOwner) return;
    openComposer(cardId, 'front');
  }, [isOwner, openComposer]);

  const handleDelete = useCallback((id) => {
    if (!isOwner) return;
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(id);
    }
  }, [isOwner, deleteCard]);

  const handleSaveCard = useCallback((cardData) => {
    if (!isOwner) return;
    if (cardData.id) {
      updateCard(cardData.id, cardData);
    } else {
      // Add type based on active tab
      const type = ui.activeTab === 'characters' ? CARD_TYPES.CHARACTER : CARD_TYPES.STORY;
      addCard({ ...cardData, type });
    }
    closeComposer();
  }, [isOwner, updateCard, addCard, closeComposer, ui.activeTab]);

  const handleCancelEdit = useCallback(() => {
    closeComposer();
  }, [closeComposer]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${url}`);
    });
  }, []);

  const handleExport = useCallback(() => {
    const storyCards = getStoryCards();
    const exportData = {
      deck: {
        id: deck.id,
        title: deck.title,
        colorLabels: colorLabels,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
      cards: cards.map((card) => ({
        id: card.id,
        type: card.type,
        title: card.title,
        frontText: card.frontText,
        backText: card.backText,
        color: card.color,
        tags: card.tags,
        linkedCharacterIds: card.linkedCharacterIds,
        position: card.position,
      })),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [deck, cards, colorLabels, getStoryCards]);

  const handleFork = useCallback(async () => {
    const newDeck = await forkDeck();
    if (newDeck) {
      alert(`Created your own copy: "${newDeck.title}"`);
    }
  }, [forkDeck]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleSaveSettings = useCallback((newColorLabels) => {
    updateColorLabels(newColorLabels);
  }, [updateColorLabels]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target.tagName.toLowerCase();
      const isTyping = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

      // Skip shortcuts when typing in text fields
      if (isTyping) {
        return;
      }

      // N - New card (when not typing)
      if ((event.key === 'n' || event.key === 'N') && isOwner && !ui.composerOpen) {
        event.preventDefault();
        handleNewCard();
      }

      // F - Flip card (when composer is open and not typing)
      if ((event.key === 'f' || event.key === 'F') && ui.composerOpen) {
        event.preventDefault();
        flipComposer();
      }

      // Escape - Close composer
      if (event.key === 'Escape' && ui.composerOpen) {
        event.preventDefault();
        closeComposer();
      }

      // Cmd/Ctrl+Z - Undo last reorder
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && isOwner && canUndoReorder) {
        event.preventDefault();
        undoReorder();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewCard, isOwner, canUndoReorder, undoReorder, ui.composerOpen, flipComposer, closeComposer]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading deck...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-ink mb-2">Something went wrong</h2>
          <p className="text-muted text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-ink text-cream rounded-lg text-sm hover:bg-ink/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Onboarding overlay for first-time visitors */}
      <Onboarding />

      {/* Read-only banner */}
      {!isOwner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800">
            You're viewing a shared deck.{' '}
            <button
              onClick={handleFork}
              className="underline hover:no-underline font-medium"
            >
              Make a copy
            </button>
            {' '}to edit.
          </p>
        </div>
      )}

      {/* Top bar */}
      <TopBar
        deckTitle={deck.title}
        onTitleChange={isOwner ? updateDeckTitle : undefined}
        onNewCard={isOwner ? handleNewCard : undefined}
        onShuffle={isOwner ? shuffleCards : undefined}
        onShare={handleShare}
        onExport={handleExport}
        onSettings={isOwner ? handleOpenSettings : undefined}
        activeTab={ui.activeTab}
        onTabChange={setActiveTab}
        viewMode={ui.viewMode}
        onViewModeChange={setViewMode}
        peekingCardVisible={ui.peekingCardVisible}
        onTogglePeekingCard={isOwner ? togglePeekingCard : undefined}
        // Legacy props (kept for transition)
        activeFilter={ui.activeFilter}
        onFilterChange={setFilter}
        characterFilter={ui.characterFilter}
        characters={getAllCharacters()}
        onCharacterFilterChange={setCharacterFilter}
        searchQuery={ui.searchQuery}
        onSearchChange={setSearchQuery}
        readOnly={!isOwner}
        saveStatus={saveStatus}
      />

      {/* Main workspace */}
      <Workspace
        onReorder={isOwner ? reorderCards : undefined}
        onEdit={isOwner ? handleEdit : undefined}
        onDelete={isOwner ? handleDelete : undefined}
        readOnly={!isOwner}
      />

      {/* Peeking card at bottom */}
      {isOwner && ui.peekingCardVisible && !ui.composerOpen && (
        <PeekingCard onClick={handleNewCard} />
      )}

      {/* Card composer modal */}
      {ui.composerOpen && (
        <CardComposer
          onSave={handleSaveCard}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
