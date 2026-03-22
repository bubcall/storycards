import { useState, useRef, useEffect } from 'react';
import {
  DEFAULT_DECK_TITLE,
  VIEW_MODES,
  VIEW_MODE_LABELS,
} from '../lib/constants';

/**
 * TopBar component - deck title, tabs, view mode, and actions
 */
function TopBar({
  deckTitle = DEFAULT_DECK_TITLE,
  onTitleChange,
  onNewCard,
  onShuffle,
  onShare,
  onExport,
  onSettings,
  activeTab = 'story',
  onTabChange,
  viewMode = VIEW_MODES.MANUAL,
  onViewModeChange,
  peekingCardVisible = true,
  onTogglePeekingCard,
  readOnly = false,
  saveStatus = 'saved',
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(deckTitle);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update title value when deckTitle prop changes
  useEffect(() => {
    setTitleValue(deckTitle);
  }, [deckTitle]);

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
      {/* Main row: Title, tabs, view mode, actions */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left side: Title + save status */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="font-display text-xl md:text-2xl text-ink bg-transparent border-b-2 border-ink focus:outline-none px-1 -mx-1 min-w-0"
              style={{ minWidth: '120px', maxWidth: '300px' }}
            />
          ) : (
            <h1
              onClick={() => onTitleChange ? setIsEditingTitle(true) : undefined}
              className={`font-display text-xl md:text-2xl text-ink ${onTitleChange ? 'cursor-pointer hover:text-ink/70' : ''} transition-colors truncate`}
              style={{ maxWidth: '300px' }}
              title={onTitleChange ? 'Click to edit title' : undefined}
            >
              {deckTitle}
            </h1>
          )}
          <SaveIndicator status={saveStatus} />
        </div>

        {/* Center: Tab switcher */}
        <div className="hidden md:flex items-center">
          <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Right side: View mode + actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* View mode selector (desktop) */}
          <div className="hidden md:block">
            <ViewModeSelector
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>

          {/* New card button */}
          {!readOnly && (
            <button
              onClick={onNewCard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              <PlusIcon />
              <span className="hidden md:inline">New Card</span>
            </button>
          )}

          {/* Actions menu */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="p-2 text-muted hover:text-ink hover:bg-cream rounded-lg transition-colors"
              aria-label="More actions"
            >
              <MoreIcon />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-faint py-1 z-50">
                {!readOnly && (
                  <>
                    <ActionMenuItem onClick={() => { onShuffle?.(); setIsActionsOpen(false); }}>
                      <ShuffleIcon />
                      Shuffle Cards
                    </ActionMenuItem>
                    <ActionMenuItem onClick={() => { onTogglePeekingCard?.(); setIsActionsOpen(false); }}>
                      {peekingCardVisible ? <EyeOffIcon /> : <EyeIcon />}
                      {peekingCardVisible ? 'Hide New Card' : 'Show New Card'}
                    </ActionMenuItem>
                    <div className="border-t border-faint my-1" />
                  </>
                )}
                <ActionMenuItem onClick={() => { onShare?.(); setIsActionsOpen(false); }}>
                  <ShareIcon />
                  Share Deck
                </ActionMenuItem>
                <ActionMenuItem onClick={() => { onExport?.(); setIsActionsOpen(false); }}>
                  <ExportIcon />
                  Export JSON
                </ActionMenuItem>
                {!readOnly && (
                  <>
                    <div className="border-t border-faint my-1" />
                    <ActionMenuItem onClick={() => { onSettings?.(); setIsActionsOpen(false); }}>
                      <SettingsIcon />
                      Settings
                    </ActionMenuItem>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Tab switcher + view mode */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 bg-cream/50 border-t border-faint/50">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
        <ViewModeSelector viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </header>
  );
}

/**
 * Tab switcher component - Story | Characters
 */
function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex bg-cream rounded-lg p-0.5">
      <button
        onClick={() => onTabChange?.('story')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'story'
            ? 'bg-white text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        Story
      </button>
      <button
        onClick={() => onTabChange?.('characters')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'characters'
            ? 'bg-white text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        Characters
      </button>
    </div>
  );
}

/**
 * View mode selector dropdown
 */
function ViewModeSelector({ viewMode, onViewModeChange }) {
  return (
    <div className="relative">
      <select
        value={viewMode}
        onChange={(e) => onViewModeChange?.(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-faint rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20 cursor-pointer"
      >
        {Object.entries(VIEW_MODES).map(([key, value]) => (
          <option key={value} value={value}>
            {VIEW_MODE_LABELS[value]}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
}

/**
 * Action menu item
 */
function ActionMenuItem({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-cream flex items-center gap-2 transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Save status indicator
 */
function SaveIndicator({ status }) {
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <CheckIcon className="w-3 h-3 text-green-600" />
        <span className="hidden md:inline">Saved</span>
      </span>
    );
  }

  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <span className="w-3 h-3 border border-muted border-t-transparent rounded-full animate-spin" />
        <span className="hidden md:inline">Saving...</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
      <DotIcon className="w-3 h-3" />
      <span className="hidden md:inline">Unsaved</span>
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

function MoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default TopBar;
