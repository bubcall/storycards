import { useCallback } from 'react';
import Board from './Board';
import useDeckStore from '../store/deckStore';
import { BOARD_LAYOUT, CARD_TYPES } from '../lib/constants';

/**
 * Workspace component - Main content area for the tactile card UX
 * Full-width, full-height layout without sidebar
 *
 * @param {Object} props
 * @param {function} props.onReorder - Callback when cards are reordered
 * @param {function} props.onEdit - Callback when card is clicked for editing
 * @param {function} props.onDelete - Callback when card is deleted
 * @param {boolean} props.readOnly - Whether the workspace is read-only
 */
function Workspace({ onReorder, onEdit, onDelete, readOnly = false }) {
  // Get cards based on active tab and view mode
  const getCardsByViewMode = useDeckStore((state) => state.getCardsByViewMode);
  const activeTab = useDeckStore((state) => state.ui.activeTab);
  const viewMode = useDeckStore((state) => state.ui.viewMode);
  const openComposer = useDeckStore((state) => state.openComposer);

  // Get filtered/sorted cards for the current view
  const cards = getCardsByViewMode();

  // Handle card click - opens composer for editing
  const handleCardClick = useCallback((cardId) => {
    if (readOnly) return;
    if (onEdit) {
      onEdit(cardId);
    } else {
      openComposer(cardId, 'front');
    }
  }, [readOnly, onEdit, openComposer]);

  return (
    <div
      className="flex-1 overflow-auto bg-cream"
      style={{
        padding: `${BOARD_LAYOUT.WORKSPACE_PADDING}px`,
      }}
    >
      {/* Main card grid - Board handles empty state internally */}
      <Board
        cards={cards}
        activeTab={activeTab}
        onReorder={readOnly ? undefined : onReorder}
        onEdit={readOnly ? undefined : handleCardClick}
        onDelete={readOnly ? undefined : onDelete}
        readOnly={readOnly}
      />

      {/* Bottom padding for peeking card */}
      <div className="h-32" />
    </div>
  );
}

export default Workspace;
