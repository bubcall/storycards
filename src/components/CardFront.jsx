import ColorSelector from './ColorSelector';
import { getColorValue, CARD_CONSTRAINTS } from '../lib/constants';

/**
 * CardFront component - Front side of the card composer
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.frontText - Main card content
 * @param {string} props.color - Selected color key
 * @param {function} props.onTitleChange - Callback when title changes
 * @param {function} props.onFrontTextChange - Callback when front text changes
 * @param {function} props.onColorChange - Callback when color changes
 * @param {function} props.onFlip - Callback to flip to back
 */
function CardFront({
  title,
  frontText,
  color,
  onTitleChange,
  onFrontTextChange,
  onColorChange,
  onFlip,
}) {
  const colorHex = getColorValue(color);

  return (
    <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Color band */}
      <div
        className="h-3 flex-shrink-0"
        style={{ backgroundColor: colorHex }}
      />

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col overflow-hidden">
        {/* Color selector */}
        <div className="mb-4">
          <ColorSelector selected={color} onChange={onColorChange} />
        </div>

        {/* Title input */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Card title..."
            maxLength={CARD_CONSTRAINTS.TITLE_MAX_LENGTH}
            className="w-full font-display text-xl text-ink bg-transparent border-b-2 border-faint focus:border-ink focus:outline-none pb-2 transition-colors"
            autoFocus
          />
          <div className="text-xs text-faint mt-1 text-right">
            {title.length}/{CARD_CONSTRAINTS.TITLE_MAX_LENGTH}
          </div>
        </div>

        {/* Front text textarea */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-xs text-muted uppercase tracking-wide mb-2">
            What happens in this beat?
          </label>
          <textarea
            value={frontText}
            onChange={(e) => onFrontTextChange(e.target.value)}
            placeholder="Describe the scene, action, or moment..."
            maxLength={CARD_CONSTRAINTS.FRONT_TEXT_MAX_LENGTH}
            className="flex-1 w-full text-sm text-ink bg-cream/50 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <div className="text-xs text-faint mt-1 text-right">
            {frontText.length}/{CARD_CONSTRAINTS.FRONT_TEXT_MAX_LENGTH}
          </div>
        </div>

        {/* Flip button */}
        <button
          type="button"
          onClick={onFlip}
          className="mt-4 w-full py-2.5 text-sm text-muted hover:text-ink border border-faint rounded-lg hover:bg-cream transition-colors flex items-center justify-center gap-2"
        >
          <FlipIcon />
          Flip to add details
        </button>
      </div>
    </div>
  );
}

function FlipIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default CardFront;
