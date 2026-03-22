import { useState, useRef, useEffect } from 'react';
import useDeckStore from '../store/deckStore';

/**
 * CharacterLinker component - Links story cards to character cards
 *
 * @param {Object} props
 * @param {string[]} props.selected - Currently selected character IDs
 * @param {function} props.onChange - Callback when selection changes
 */
function CharacterLinker({ selected = [], onChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const getAllCharacters = useDeckStore((state) => state.getAllCharacters);
  const characters = getAllCharacters();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCharacter = (charId) => {
    if (selected.includes(charId)) {
      onChange(selected.filter((id) => id !== charId));
    } else {
      onChange([...selected, charId]);
    }
  };

  const removeCharacter = (charId) => {
    onChange(selected.filter((id) => id !== charId));
  };

  // Get selected character details
  const selectedCharacters = characters.filter((char) =>
    selected.includes(char.id)
  );

  if (characters.length === 0) {
    return (
      <div className="text-sm text-muted italic">
        No characters yet. Create character cards in the Characters tab to link them here.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected characters */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedCharacters.map((char) => (
          <span
            key={char.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
          >
            <UserIcon />
            {char.name}
            <button
              type="button"
              onClick={() => removeCharacter(char.id)}
              className="text-teal-600 hover:text-teal-800"
            >
              <XIcon />
            </button>
          </span>
        ))}
      </div>

      {/* Add character button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-3 py-2 text-sm text-left bg-cream/50 rounded-lg hover:bg-cream transition-colors flex items-center gap-2"
      >
        <PlusIcon />
        {selected.length === 0 ? 'Link characters to this card' : 'Link more characters'}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-faint max-h-48 overflow-auto">
          {characters.map((char) => {
            const isSelected = selected.includes(char.id);
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => toggleCharacter(char.id)}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors
                  ${isSelected ? 'bg-teal-50 text-teal-800' : 'text-muted hover:bg-cream/50'}
                `}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-faint'}`}>
                  {isSelected && <CheckIcon />}
                </span>
                <UserIcon />
                {char.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default CharacterLinker;
