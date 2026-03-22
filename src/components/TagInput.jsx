import { useState, useRef, useEffect } from 'react';
import { STORY_TAGS } from '../lib/constants';

/**
 * TagInput component - Autocomplete tag input with suggestions
 *
 * @param {Object} props
 * @param {string[]} props.selected - Currently selected tags
 * @param {function} props.onChange - Callback when tags change
 * @param {string[]} props.suggestions - Available tag suggestions (defaults to STORY_TAGS)
 */
function TagInput({ selected = [], onChange, suggestions = STORY_TAGS }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter suggestions based on input and already selected tags
  const filteredSuggestions = suggestions.filter(
    (tag) =>
      !selected.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(selected.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && showSuggestions) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, filteredSuggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
      removeTag(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-ink/10 text-ink text-xs rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-ink/50 hover:text-ink"
            >
              <XIcon />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={selected.length === 0 ? 'Add tags (Twist, Setup, Payoff...)' : 'Add more tags...'}
        className="w-full px-3 py-2 text-sm bg-cream/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-faint max-h-48 overflow-auto">
          {filteredSuggestions.map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={`
                w-full px-3 py-2 text-left text-sm transition-colors
                ${index === highlightedIndex ? 'bg-cream text-ink' : 'text-muted hover:bg-cream/50'}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default TagInput;
