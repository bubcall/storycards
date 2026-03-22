import { forwardRef } from 'react';
import { getCategoryColor, getCategoryLabel } from '../lib/constants';

/**
 * Card component - displays a single story card/beat
 *
 * @param {Object} props
 * @param {string} props.id - Unique card identifier
 * @param {string} props.title - Card title (required)
 * @param {string} props.body - Card body text (optional)
 * @param {string} props.category - Category enum value
 * @param {string[]} props.characters - Array of character names
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
    title,
    body,
    category,
    characters = [],
    position,
    isDragging = false,
    isOver = false,
    onEdit,
    onDelete,
    dragHandleProps = {},
    style = {},
    ...props
  },
  ref
) {
  const categoryColor = getCategoryColor(category);
  const categoryLabel = getCategoryLabel(category);

  return (
    <div
      ref={ref}
      data-card-id={id}
      className={`
        relative bg-white rounded-lg shadow-sm border border-faint/30
        transition-all duration-150 ease-out
        ${isDragging ? 'opacity-40 rotate-2 scale-105 shadow-lg z-50' : ''}
        ${isOver ? 'ring-2 ring-dashed ring-plot' : ''}
        ${!isDragging ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
      `}
      style={{
        ...style,
        minWidth: '220px',
      }}
      {...props}
    >
      {/* Category color band */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Card content */}
      <div className="p-4">
        {/* Header: Category label + Position */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: categoryColor }}
          >
            {categoryLabel}
          </span>
          <span className="font-mono text-xs text-muted">
            #{position}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg text-ink leading-tight mb-2">
          {title}
        </h3>

        {/* Body text */}
        {body && (
          <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-4">
            {body}
          </p>
        )}

        {/* Character tags */}
        {characters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {characters.map((character, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cream text-ink/70"
              >
                {character}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Actions + Drag handle */}
        <div className="flex items-center justify-between pt-3 border-t border-faint/30">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(id)}
              className="text-xs text-muted hover:text-ink transition-colors"
              aria-label="Edit card"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(id)}
              className="text-xs text-muted hover:text-red-600 transition-colors"
              aria-label="Delete card"
            >
              Delete
            </button>
          </div>

          {/* Drag handle */}
          <div
            {...dragHandleProps}
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

export default Card;
