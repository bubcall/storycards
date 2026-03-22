import { useState } from 'react';
import useDeckStore from '../store/deckStore';

/**
 * PeekingCard component - Bottom-peeking new card trigger
 * Partial visibility at bottom of screen, expands on hover, opens composer on click
 *
 * @param {Object} props
 * @param {function} props.onClick - Callback when clicked to open composer
 */
function PeekingCard({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const activeTab = useDeckStore((state) => state.ui.activeTab);

  const handleClick = () => {
    setIsAnimating(true);
    // Delay the onClick to allow animation to start
    setTimeout(() => {
      onClick();
      setIsAnimating(false);
    }, 200);
  };

  const cardLabel = activeTab === 'characters' ? 'New Character' : 'New Card';

  return (
    <div
      className={`
        fixed bottom-0 left-1/2 -translate-x-1/2 z-30
        transition-all duration-300 ease-out cursor-pointer
        ${isAnimating ? 'animate-pull-up' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translateX(-50%) translateY(${isHovered ? '50%' : '70%'})`,
      }}
    >
      {/* Card visual */}
      <div
        className={`
          relative bg-white rounded-t-2xl shadow-2xl border border-b-0 border-faint/50
          transition-all duration-300
          ${isHovered ? 'shadow-3xl' : ''}
        `}
        style={{
          width: '280px',
          height: '200px',
        }}
      >
        {/* Color band placeholder */}
        <div className="h-3 rounded-t-2xl bg-gradient-to-r from-faint/30 via-faint/50 to-faint/30" />

        {/* Content preview */}
        <div className="p-5">
          {/* Plus icon */}
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center">
            <PlusIcon className={`w-6 h-6 text-muted transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </div>

          {/* Label */}
          <p className="text-center text-muted text-sm font-medium">
            {cardLabel}
          </p>

          {/* Hint */}
          <p className="text-center text-faint text-xs mt-1">
            Click or press <kbd className="px-1 py-0.5 bg-cream rounded text-[10px]">N</kbd>
          </p>
        </div>

        {/* Subtle line patterns to suggest card lines */}
        <div className="absolute bottom-4 left-5 right-5 space-y-2">
          <div className="h-2 bg-cream/50 rounded" />
          <div className="h-2 bg-cream/30 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export default PeekingCard;
