import useSummary from '../hooks/useSummary';

/**
 * SummaryPanel component - displays AI-generated story summary
 *
 * @param {Object} props
 * @param {string} props.deckId - Deck UUID
 * @param {Array} props.cards - Array of cards in the deck
 */
function SummaryPanel({ deckId, cards = [] }) {
  const {
    summary,
    isLoading,
    error,
    hasChanges,
    hasSummary,
    characterIndex,
    cardCount,
    generateSummary,
  } = useSummary(deckId, cards);

  // No cards state
  if (cardCount === 0) {
    return (
      <div className="text-center py-8">
        <EmptyIcon />
        <h3 className="font-medium text-ink mb-1">No Cards Yet</h3>
        <p className="text-sm text-muted">
          Add some cards to your deck to generate an AI summary.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <LoadingDots />
        <p className="text-sm text-muted mt-4">Generating summary...</p>
      </div>
    );
  }

  // Error state (no summary yet)
  if (error && !hasSummary) {
    return (
      <div className="text-center py-8">
        <ErrorIcon />
        <h3 className="font-medium text-ink mb-1">Something went wrong</h3>
        <p className="text-sm text-muted mb-4">{error}</p>
        <button
          onClick={generateSummary}
          className="px-4 py-2 bg-ink text-cream rounded-lg text-sm hover:bg-ink/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Initial state (no summary yet)
  if (!hasSummary) {
    return (
      <div className="text-center py-8">
        <SummaryIcon />
        <h3 className="font-medium text-ink mb-1">AI Summary</h3>
        <p className="text-sm text-muted mb-4">
          Generate an AI-powered summary of your story based on all {cardCount} cards.
        </p>
        <button
          onClick={generateSummary}
          className="px-4 py-2 bg-ink text-cream rounded-lg text-sm hover:bg-ink/90 inline-flex items-center gap-2"
        >
          <SparklesIcon />
          Generate Summary
        </button>
      </div>
    );
  }

  // Summary display
  return (
    <div className="space-y-6">
      {/* Summary text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-ink">Story Summary</h3>
          {hasChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Deck changed
            </span>
          )}
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">{summary}</p>

        {/* Error message if retry failed */}
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}

        {/* Re-summarize button */}
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className="mt-4 px-3 py-1.5 text-sm text-muted hover:text-ink border border-faint hover:border-muted rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshIcon />
          {hasChanges ? 'Update Summary' : 'Re-summarize'}
        </button>
      </div>

      {/* Character index */}
      {characterIndex.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-ink mb-2">Characters</h4>
          <div className="flex flex-wrap gap-2">
            {characterIndex.map(({ name, count }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-1 bg-cream rounded text-xs"
              >
                <span className="text-ink">{name}</span>
                <span className="text-muted">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card count */}
      <p className="text-xs text-muted">
        Based on {cardCount} card{cardCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// Loading animation with dots
function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <span className="w-2 h-2 bg-ink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-ink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-ink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Icons
function SummaryIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-faint/20 flex items-center justify-center">
      <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  );
}

function EmptyIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-faint/20 flex items-center justify-center">
      <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default SummaryPanel;
