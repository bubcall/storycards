import { useState } from 'react';
import {
  FILTER_OPTIONS,
  DEFAULT_DECK_TITLE,
} from '../lib/constants';

/**
 * TopBar component - deck title, actions, filters, and search
 *
 * @param {Object} props
 * @param {string} props.deckTitle - Current deck title
 * @param {function} props.onTitleChange - Callback when title changes
 * @param {function} props.onNewCard - Callback to create new card
 * @param {function} props.onShuffle - Callback to shuffle cards
 * @param {function} props.onSummarize - Callback to generate AI summary
 * @param {function} props.onShare - Callback to share deck
 * @param {function} props.onExport - Callback to export deck as JSON
 * @param {string} props.activeFilter - Currently active category filter
 * @param {function} props.onFilterChange - Callback when filter changes
 * @param {string} props.characterFilter - Currently selected character filter
 * @param {Array} props.characters - Array of unique character names
 * @param {function} props.onCharacterFilterChange - Callback when character filter changes
 * @param {string} props.searchQuery - Current search query
 * @param {function} props.onSearchChange - Callback when search changes
 * @param {string} props.saveStatus - Save status ('saved' | 'saving' | 'unsaved')
 * @param {function} props.onMenuToggle - Callback to toggle mobile sidebar
 * @param {boolean} props.isMobileSidebarOpen - Whether mobile sidebar is open
 */
function TopBar({
  deckTitle = DEFAULT_DECK_TITLE,
  onTitleChange,
  onNewCard,
  onShuffle,
  onSummarize,
  onShare,
  onExport,
  activeFilter = 'all',
  onFilterChange,
  characterFilter = null,
  characters = [],
  onCharacterFilterChange,
  searchQuery = '',
  onSearchChange,
  saveStatus = 'saved',
  onMenuToggle,
  isMobileSidebarOpen = false,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(deckTitle);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = titleValue.trim() || DEFAULT_DECK_TITLE;
    setTitleValue(newTitle);
    if (newTitle !== deckTitle) {
      onTitleChange?.(newTitle);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setTitleValue(deckTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="bg-white border-b border-faint sticky top-0 z-40">
      {/* Top row: Title and actions */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left side: hamburger (mobile) + title + save status */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger menu button (mobile/tablet only) */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 -ml-1.5 text-ink hover:bg-cream rounded-lg transition-colors"
            aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileSidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>

          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="font-display text-xl md:text-2xl text-ink bg-transparent border-b-2 border-plot focus:outline-none px-1 -mx-1"
              style={{ minWidth: '150px' }}
            />
          ) : (
            <h1
              onClick={() => onTitleChange ? setIsEditingTitle(true) : undefined}
              className={`font-display text-xl md:text-2xl text-ink ${onTitleChange ? 'cursor-pointer hover:text-ink/70' : ''} transition-colors truncate max-w-[200px] md:max-w-none`}
              title={onTitleChange ? 'Click to edit title' : undefined}
            >
              {deckTitle}
            </h1>
          )}
          <SaveIndicator status={saveStatus} />
        </div>

        {/* Action buttons (desktop only) */}
        <div className="hidden lg:flex items-center gap-2">
          <ActionButton onClick={onNewCard} primary>
            <PlusIcon />
            New Card
          </ActionButton>

          <ActionButton onClick={onShuffle}>
            <ShuffleIcon />
            Shuffle
          </ActionButton>

          <ActionButton onClick={onSummarize}>
            <SparklesIcon />
            Summarize
          </ActionButton>

          <ActionButton onClick={onShare}>
            <ShareIcon />
            Share
          </ActionButton>

          <ActionButton onClick={onExport}>
            <ExportIcon />
            Export
          </ActionButton>
        </div>

        {/* Mobile action buttons (only most important ones) */}
        <div className="flex lg:hidden items-center gap-1">
          <ActionButton onClick={onNewCard} primary>
            <PlusIcon />
          </ActionButton>
          <ActionButton onClick={onShare}>
            <ShareIcon />
          </ActionButton>
        </div>
      </div>

      {/* Bottom row: Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-2 gap-2 bg-cream/50">
        {/* Category filter pills (horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {FILTER_OPTIONS.map((option) => (
            <FilterPill
              key={option.value}
              label={option.label}
              color={option.color}
              active={activeFilter === option.value}
              onClick={() => onFilterChange?.(option.value)}
            />
          ))}
        </div>

        {/* Character filter and search */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Character filter dropdown */}
          {characters.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                value={characterFilter || ''}
                onChange={(e) => onCharacterFilterChange?.(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-faint rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot cursor-pointer"
              >
                <option value="">All Characters</option>
                {characters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          )}

          {/* Search input */}
          <div className="relative flex-1 md:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search cards..."
              className="pl-9 pr-3 py-1.5 w-full md:w-56 bg-white border border-faint rounded-lg text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-ink"
              >
                <XIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Action button component
 */
function ActionButton({ onClick, primary = false, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${primary
          ? 'bg-ink text-cream hover:bg-ink/90'
          : 'bg-cream text-ink hover:bg-faint/30'
        }
      `}
    >
      {children}
    </button>
  );
}

/**
 * Filter pill component
 */
function FilterPill({ label, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all
        ${active
          ? 'bg-ink text-cream'
          : 'bg-white text-muted hover:text-ink border border-faint hover:border-muted'
        }
      `}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}

/**
 * Save status indicator component
 */
function SaveIndicator({ status }) {
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <CheckIcon className="w-3 h-3 text-green-600" />
        Saved
      </span>
    );
  }

  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <span className="w-3 h-3 border border-muted border-t-transparent rounded-full animate-spin" />
        Saving...
      </span>
    );
  }

  // unsaved
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
      <DotIcon className="w-3 h-3" />
      Unsaved changes
    </span>
  );
}

// Icons
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DotIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default TopBar;
