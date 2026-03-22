import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import SortableCard from './SortableCard';
import Card from './Card';
import { BOARD_LAYOUT } from '../lib/constants';
import useDeckStore from '../store/deckStore';

/**
 * Board component - displays cards in a responsive grid with drag-and-drop
 *
 * @param {Object} props
 * @param {Array} props.cards - Array of card objects
 * @param {function} props.onReorder - Callback when cards are reordered (oldIndex, newIndex)
 * @param {function} props.onEdit - Callback when edit is clicked on a card
 * @param {function} props.onDelete - Callback when delete is clicked on a card
 */
function Board({ cards = [], onReorder, onEdit, onDelete }) {
  const [activeId, setActiveId] = useState(null);
  const isShuffling = useDeckStore((state) => state.isShuffling);

  // Configure sensors for pointer, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch devices
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get card IDs for SortableContext
  const cardIds = cards.map((card) => card.id);

  // Find the active card for DragOverlay
  const activeCard = activeId ? cards.find((card) => card.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder?.(oldIndex, newIndex);
      }
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-faint/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h3 className="font-display text-xl text-ink mb-2">No cards yet</h3>
        <p className="text-muted text-sm max-w-xs">
          Start building your story by adding your first card. Press <kbd className="px-1.5 py-0.5 bg-cream rounded text-xs font-mono">N</kbd> or click the + button.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={cardIds} strategy={rectSortingStrategy}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${BOARD_LAYOUT.MIN_CARD_WIDTH}px, 1fr))`,
            gap: `${BOARD_LAYOUT.CARD_GAP}px`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={isShuffling ? 'transition-transform duration-200' : ''}
              style={isShuffling ? {
                transform: `translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40}px) rotate(${(Math.random() - 0.5) * 10}deg)`,
                opacity: 0.7,
              } : {}}
            >
              <SortableCard
                {...card}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - shows the card being dragged */}
      <DragOverlay>
        {activeCard ? (
          <Card
            {...activeCard}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default Board;
