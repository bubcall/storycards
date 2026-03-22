import { useState, useEffect, useCallback } from 'react';
import CardFront from './CardFront';
import CardBack from './CardBack';
import useDeckStore from '../store/deckStore';
import { CARD_TYPES, CARD_COLORS } from '../lib/constants';

/**
 * CardComposer component - Central modal for writing/editing cards
 * Features 3D flip animation between front and back
 *
 * @param {Object} props
 * @param {function} props.onSave - Callback when card is saved
 * @param {function} props.onCancel - Callback when editing is cancelled
 */
function CardComposer({ onSave, onCancel }) {
  const ui = useDeckStore((state) => state.ui);
  const getCardById = useDeckStore((state) => state.getCardById);
  const flipComposer = useDeckStore((state) => state.flipComposer);

  // Get the card being edited (if any)
  const editingCard = ui.composerCardId ? getCardById(ui.composerCardId) : null;
  const isEditing = !!editingCard;

  // Determine card type based on active tab for new cards
  const activeTab = ui.activeTab;
  const defaultType = activeTab === 'characters' ? CARD_TYPES.CHARACTER : CARD_TYPES.STORY;

  // Local state for card data
  const [cardData, setCardData] = useState({
    id: null,
    type: defaultType,
    title: '',
    frontText: '',
    backText: '',
    color: CARD_COLORS.GRAY,
    tags: [],
    linkedCharacterIds: [],
  });

  // Initialize card data when editing
  useEffect(() => {
    if (editingCard) {
      setCardData({
        id: editingCard.id,
        type: editingCard.type || CARD_TYPES.STORY,
        title: editingCard.title || '',
        frontText: editingCard.frontText || editingCard.body || '',
        backText: editingCard.backText || '',
        color: editingCard.color || CARD_COLORS.GRAY,
        tags: editingCard.tags || [],
        linkedCharacterIds: editingCard.linkedCharacterIds || [],
      });
    } else {
      // Reset for new card
      setCardData({
        id: null,
        type: defaultType,
        title: '',
        frontText: '',
        backText: '',
        color: CARD_COLORS.GRAY,
        tags: [],
        linkedCharacterIds: [],
      });
    }
  }, [editingCard, defaultType]);

  // Update handlers
  const updateField = useCallback((field, value) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!cardData.title.trim()) {
      // Focus on title input if empty
      return;
    }
    onSave(cardData);
  }, [cardData, onSave]);

  // Handle cancel with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const isFlipped = ui.composerSide === 'back';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Composer container */}
      <div className="relative w-full max-w-md">
        {/* Card with flip animation */}
        <div
          className="relative w-full aspect-[3/4] preserve-3d transition-transform duration-500 ease-out"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
        >
          {/* Front */}
          <CardFront
            title={cardData.title}
            frontText={cardData.frontText}
            color={cardData.color}
            onTitleChange={(v) => updateField('title', v)}
            onFrontTextChange={(v) => updateField('frontText', v)}
            onColorChange={(v) => updateField('color', v)}
            onFlip={flipComposer}
          />

          {/* Back */}
          <CardBack
            backText={cardData.backText}
            tags={cardData.tags}
            linkedCharacterIds={cardData.linkedCharacterIds}
            color={cardData.color}
            cardType={cardData.type}
            onBackTextChange={(v) => updateField('backText', v)}
            onTagsChange={(v) => updateField('tags', v)}
            onLinkedCharactersChange={(v) => updateField('linkedCharacterIds', v)}
            onFlip={flipComposer}
            onFinish={handleSave}
            isEditing={isEditing}
          />
        </div>

        {/* Cancel button (floating) */}
        <button
          onClick={onCancel}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-muted hover:text-ink transition-colors"
          aria-label="Cancel"
        >
          <XIcon />
        </button>

        {/* Keyboard hint */}
        <div className="mt-4 text-center text-xs text-white/70">
          Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded">F</kbd> to flip
          {' '}&bull;{' '}
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default CardComposer;
