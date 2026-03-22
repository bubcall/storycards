import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/constants';

/**
 * OrderList component - displays cards in story order
 *
 * @param {Object} props
 * @param {Array} props.cards - Array of cards sorted by position
 * @param {function} props.onCardClick - Callback when card is clicked (for scroll/highlight)
 * @param {function} props.onShuffle - Callback to shuffle cards
 * @param {boolean} props.readOnly - Whether in read-only mode
 */
function OrderList({ cards = [], onCardClick, onShuffle, readOnly = false }) {
  // Sort cards by position
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyIcon />
        <h3 className="font-medium text-ink mb-1">No Cards Yet</h3>
        <p className="text-sm text-muted">
          Add cards to see them in story order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with card count and shuffle button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {cards.length} card{cards.length !== 1 ? 's' : ''} in story order
        </p>
        {!readOnly && onShuffle && (
          <button
            onClick={onShuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-ink border border-faint hover:border-muted rounded-lg transition-colors"
          >
            <ShuffleIcon />
            Shuffle
          </button>
        )}
      </div>

      {/* Card list */}
      <div className="space-y-1">
        {sortedCards.map((card) => (
          <OrderListItem
            key={card.id}
            card={card}
            onClick={() => onCardClick?.(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual card item in the order list
 */
function OrderListItem({ card, onClick }) {
  const categoryColor = CATEGORY_COLORS[card.category] || '#888888';
  const categoryLabel = CATEGORY_LABELS[card.category] || card.category;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-cream/70 transition-colors text-left group"
    >
      {/* Position number */}
      <span className="font-mono text-xs text-muted w-6 shrink-0">
        {card.position}.
      </span>

      {/* Category color dot */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: categoryColor }}
        title={categoryLabel}
      />

      {/* Title */}
      <span className="flex-1 text-sm text-ink truncate group-hover:text-ink/80">
        {card.title}
      </span>

      {/* Category label */}
      <span className="text-xs text-muted shrink-0 hidden sm:inline">
        {categoryLabel}
      </span>

      {/* Arrow indicator on hover */}
      <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <ArrowIcon />
      </span>
    </button>
  );
}

// Icons
function EmptyIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-faint/20 flex items-center justify-center">
      <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
  );
}

function ShuffleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default OrderList;
