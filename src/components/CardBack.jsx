import TagInput from './TagInput';
import CharacterLinker from './CharacterLinker';
import { getColorValue, CARD_CONSTRAINTS, CARD_TYPES } from '../lib/constants';

/**
 * CardBack component - Back side of the card composer
 *
 * @param {Object} props
 * @param {string} props.backText - Notes/details content
 * @param {string[]} props.tags - Selected tags
 * @param {string[]} props.linkedCharacterIds - Linked character IDs
 * @param {string} props.color - Card color (for the band)
 * @param {string} props.cardType - Card type ('story' or 'character')
 * @param {function} props.onBackTextChange - Callback when back text changes
 * @param {function} props.onTagsChange - Callback when tags change
 * @param {function} props.onLinkedCharactersChange - Callback when linked characters change
 * @param {function} props.onFlip - Callback to flip to front
 * @param {function} props.onFinish - Callback to finish and save card
 * @param {boolean} props.isEditing - Whether editing an existing card
 */
function CardBack({
  backText,
  tags,
  linkedCharacterIds,
  color,
  cardType,
  onBackTextChange,
  onTagsChange,
  onLinkedCharactersChange,
  onFlip,
  onFinish,
  isEditing,
}) {
  const colorHex = getColorValue(color);
  const isStoryCard = cardType === CARD_TYPES.STORY;

  return (
    <div
      className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
      style={{ transform: 'rotateY(180deg)' }}
    >
      {/* Color band */}
      <div
        className="h-3 flex-shrink-0"
        style={{ backgroundColor: colorHex }}
      />

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col overflow-hidden">
        {/* Back text / Notes */}
        <div className="flex-1 flex flex-col min-h-0 mb-4">
          <label className="text-xs text-muted uppercase tracking-wide mb-2">
            {isStoryCard ? 'Notes & Details' : 'Character Details'}
          </label>
          <textarea
            value={backText}
            onChange={(e) => onBackTextChange(e.target.value)}
            placeholder={isStoryCard
              ? 'Add notes, context, or behind-the-scenes details...'
              : 'Wants, fears, secrets, backstory...'
            }
            maxLength={CARD_CONSTRAINTS.BACK_TEXT_MAX_LENGTH}
            className="flex-1 w-full text-sm text-ink bg-cream/50 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <div className="text-xs text-faint mt-1 text-right">
            {backText.length}/{CARD_CONSTRAINTS.BACK_TEXT_MAX_LENGTH}
          </div>
        </div>

        {/* Tags (story cards only) */}
        {isStoryCard && (
          <div className="mb-4">
            <label className="text-xs text-muted uppercase tracking-wide mb-2 block">
              Story Function Tags
            </label>
            <TagInput selected={tags} onChange={onTagsChange} />
          </div>
        )}

        {/* Character linking (story cards only) */}
        {isStoryCard && (
          <div className="mb-4">
            <label className="text-xs text-muted uppercase tracking-wide mb-2 block">
              Linked Characters
            </label>
            <CharacterLinker
              selected={linkedCharacterIds}
              onChange={onLinkedCharactersChange}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={onFlip}
            className="flex-1 py-2.5 text-sm text-muted hover:text-ink border border-faint rounded-lg hover:bg-cream transition-colors flex items-center justify-center gap-2"
          >
            <FlipIcon />
            Back to front
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="flex-1 py-2.5 text-sm bg-ink text-cream rounded-lg hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
          >
            <CheckIcon />
            {isEditing ? 'Save Changes' : 'Place Card'}
          </button>
        </div>
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

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default CardBack;
