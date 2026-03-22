import { forwardRef } from 'react';
import { getColorValue, getColorLabel, CARD_TYPES } from '../lib/constants';
import useDeckStore from '../store/deckStore';

/**
 * Card component - displays a single story/character card
 *
 * @param {Object} props
 * @param {string} props.id - Unique card identifier
 * @param {string} props.type - Card type ('story' or 'character')
 * @param {string} props.title - Card title (required)
 * @param {string} props.frontText - Main card content
 * @param {string} props.backText - Notes/details (back of card)
 * @param {string} props.color - Color key from 10-color system
 * @param {string[]} props.tags - Story function tags
 * @param {string[]} props.linkedCharacterIds - Linked character card IDs
 * @param {number} props.position - Position number in deck
 * @param {boolean} props.isDragging - Whether card is being dragged
 * @param {boolean} props.isOver - Whether another card is being dragged over this one
 * @param {function} props.onEdit - Edit button click handler
 * @param {function} props.onDelete - Delete button click handler
 * @param {Object} props.dragHandleProps - Props for drag handle from dnd-kit
 * @param {Object} props.style - Additional styles (for dnd-kit transforms)
 */
const Card = forwardRef(function Card(
  {
    id,
    type = CARD_TYPES.STORY,
    title,
    frontText,
    backText,
    color = 'gray',
    tags = [],
    linkedCharacterIds = [],
    position,
    isDragging = false,
    isOver = false,
    onEdit,
    onDelete,
    dragHandleProps = {},
    style = {},
    // Legacy props for backwards compatibility
    body,
    category,
    characters = [],
    ...props
  },
  ref
) {
  // Get color labels from store
  const colorLabels = useDeckStore((state) => state.colorLabels);
  const getCharacterById = useDeckStore((state) => state.getCharacterById);

  // Use new color system, fallback to category mapping
  const colorHex = getColorValue(color);
  const colorLabel = getColorLabel(color, colorLabels);

  // Use frontText, fallback to body for legacy cards
  const displayText = frontText || body || '';

  // Get linked character names
  const linkedCharacters = linkedCharacterIds
    .map((charId) => {
      const char = getCharacterById(charId);
      return char?.title;
    })
    .filter(Boolean);

  // Combine with legacy characters for backwards compatibility
  const allCharacters = [...linkedCharacters, ...characters].filter(
    (char, index, arr) => arr.indexOf(char) === index
  );

  return (
    <div
      ref={ref}
      data-card-id={id}
      className={`
        relative bg-white rounded-lg shadow-sm border border-faint/30
        transition-all duration-150 ease-out
        ${isDragging ? 'opacity-40 rotate-2 scale-105 shadow-lg z-50' : ''}
        ${isOver ? 'ring-2 ring-dashed ring-ink/30' : ''}
        ${!isDragging ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
      `}
      style={{
        ...style,
        minWidth: '220px',
      }}
      onClick={() => onEdit?.(id)}
      {...props}
    >
      {/* Color band */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: colorHex }}
      />

      {/* Card content */}
      <div className="p-4">
        {/* Header: Color label + Position */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium uppercase tracking-wide truncate max-w-[150px]"
            style={{ color: colorHex }}
            title={colorLabel}
          >
            {colorLabel}
          </span>
          <span className="font-mono text-xs text-muted flex-shrink-0">
            #{position}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg text-ink leading-tight mb-2">
          {title}
        </h3>

        {/* Front text preview */}
        {displayText && (
          <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-3">
            {displayText}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ink/5 text-ink/70"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Linked characters */}
        {allCharacters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {allCharacters.slice(0, 2).map((character, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cream text-ink/70"
              >
                <UserIcon />
                {character}
              </span>
            ))}
            {allCharacters.length > 2 && (
              <span className="text-xs text-muted">+{allCharacters.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer: Actions + Drag handle */}
        <div className="flex items-center justify-between pt-3 border-t border-faint/30">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(id);
              }}
              className="text-xs text-muted hover:text-ink transition-colors"
              aria-label="Edit card"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id);
              }}
              className="text-xs text-muted hover:text-red-600 transition-colors"
              aria-label="Delete card"
            >
              Delete
            </button>
          </div>

          {/* Drag handle */}
          <div
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 text-faint hover:text-muted transition-colors"
            aria-label="Drag to reorder"
          >
            <DragHandleIcon />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Drag handle icon (6-dot grip pattern)
 */
function DragHandleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

/**
 * Small user icon for character pills
 */
function UserIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default Card;
