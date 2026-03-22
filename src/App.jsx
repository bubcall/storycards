import { useEffect, useCallback, useState } from 'react';
import TopBar from './components/TopBar';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import useDeckStore from './store/deckStore';
import useDeck from './hooks/useDeck';
import useCards from './hooks/useCards';

function App() {
  // Deck loading and persistence
  const { isLoading, error, isOwner, updateDeckTitle, saveStatus, forkDeck } = useDeck();

  // Card operations with API sync
  const { addCard, updateCard, deleteCard, reorderCards, shuffleCards, undoReorder } = useCards();

  // Reorder history for undo (works for drag-drop and shuffle)
  const canUndoReorder = useDeckStore((state) => state.reorderHistory.length > 0);

  // Deck state from store
  const deck = useDeckStore((state) => state.deck);
  const cards = useDeckStore((state) => state.cards);

  // UI state from store
  const ui = useDeckStore((state) => state.ui);
  const setFilter = useDeckStore((state) => state.setFilter);
  const setCharacterFilter = useDeckStore((state) => state.setCharacterFilter);
  const setSearchQuery = useDeckStore((state) => state.setSearchQuery);
  const getAllCharacters = useDeckStore((state) => state.getAllCharacters);
  const setEditingCard = useDeckStore((state) => state.setEditingCard);
  const clearEditingCard = useDeckStore((state) => state.clearEditingCard);
  const setSidebarTab = useDeckStore((state) => state.setSidebarTab);

  // Selectors
  const getFilteredCards = useDeckStore((state) => state.getFilteredCards);
  const getEditingCard = useDeckStore((state) => state.getEditingCard);

  const filteredCards = getFilteredCards();
  const editingCard = getEditingCard();

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handlers
  const handleNewCard = useCallback(() => {
    clearEditingCard();
    setSidebarTab('form');
    setIsMobileSidebarOpen(true);
  }, [clearEditingCard, setSidebarTab]);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const handleEdit = (id) => {
    if (!isOwner) return;
    setEditingCard(id);
    setIsMobileSidebarOpen(true);
  };

  const handleDelete = (id) => {
    if (!isOwner) return;
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(id);
    }
  };

  const handleSaveCard = (cardData) => {
    if (!isOwner) return;
    if (cardData.id) {
      updateCard(cardData.id, cardData);
      clearEditingCard();
    } else {
      addCard(cardData);
    }
  };

  const handleCancelEdit = () => {
    clearEditingCard();
  };

  const handleSummarize = () => {
    setSidebarTab('summary');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${url}`);
    });
  };

  const handleExport = () => {
    // Build export data
    const exportData = {
      deck: {
        id: deck.id,
        title: deck.title,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
      cards: cards.map((card) => ({
        id: card.id,
        title: card.title,
        body: card.body,
        category: card.category,
        characters: card.characters,
        position: card.position,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    // Create blob and download
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
  };

  const handleFork = async () => {
    const newDeck = await forkDeck();
    if (newDeck) {
      alert(`Created your own copy: "${newDeck.title}"`);
    }
  };

  const handleCardClick = (cardId) => {
    // Scroll to card on board and briefly highlight it
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      cardElement.classList.add('ring-2', 'ring-plot', 'ring-offset-2');
      setTimeout(() => {
        cardElement.classList.remove('ring-2', 'ring-plot', 'ring-offset-2');
      }, 2000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return;
      }

      // N - New card
      if ((event.key === 'n' || event.key === 'N') && isOwner) {
        event.preventDefault();
        handleNewCard();
      }

      // Cmd/Ctrl+Z - Undo last reorder
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && isOwner && canUndoReorder) {
        event.preventDefault();
        undoReorder();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewCard, isOwner, canUndoReorder, undoReorder]);

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
        onSummarize={handleSummarize}
        onShare={handleShare}
        onExport={handleExport}
        activeFilter={ui.activeFilter}
        onFilterChange={setFilter}
        characterFilter={ui.characterFilter}
        characters={getAllCharacters()}
        onCharacterFilterChange={setCharacterFilter}
        searchQuery={ui.searchQuery}
        onSearchChange={setSearchQuery}
        readOnly={!isOwner}
        saveStatus={saveStatus}
        onMenuToggle={handleToggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Board
            cards={filteredCards}
            onReorder={isOwner ? reorderCards : undefined}
            onEdit={isOwner ? handleEdit : undefined}
            onDelete={isOwner ? handleDelete : undefined}
            readOnly={!isOwner}
          />
        </main>

        {/* Desktop Sidebar (lg and up) */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={ui.sidebarTab}
            onTabChange={setSidebarTab}
            editingCard={editingCard}
            onSaveCard={isOwner ? handleSaveCard : undefined}
            onCancelEdit={handleCancelEdit}
            cards={cards}
            deckId={deck.id}
            onCardClick={handleCardClick}
            onShuffle={isOwner ? shuffleCards : undefined}
            readOnly={!isOwner}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet Sidebar (below lg) */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={handleCloseMobileSidebar}
          />
        )}

        <div
          className={`
            fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl
            transform transition-transform duration-300 ease-out
            ${isMobileSidebarOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
          style={{ maxHeight: '85vh' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1.5 bg-faint rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleCloseMobileSidebar}
            className="absolute top-3 right-3 p-1 text-muted hover:text-ink"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Sidebar content */}
          <div className="overflow-auto" style={{ maxHeight: 'calc(85vh - 40px)' }}>
            <Sidebar
              activeTab={ui.sidebarTab}
              onTabChange={setSidebarTab}
              editingCard={editingCard}
              onSaveCard={isOwner ? handleSaveCard : undefined}
              onCancelEdit={handleCancelEdit}
              cards={cards}
              deckId={deck.id}
              onCardClick={(id) => {
                handleCardClick(id);
                handleCloseMobileSidebar();
              }}
              onShuffle={isOwner ? shuffleCards : undefined}
              readOnly={!isOwner}
              isMobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
