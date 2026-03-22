import { useState, useEffect } from 'react';
import { COLOR_LIST, DEFAULT_COLOR_LABELS } from '../lib/constants';
import useDeckStore from '../store/deckStore';

/**
 * SettingsModal component - Deck settings including color label customization
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSave - Save handler (receives updated colorLabels)
 */
function SettingsModal({ isOpen, onClose, onSave }) {
  const colorLabels = useDeckStore((state) => state.colorLabels);
  const [editedLabels, setEditedLabels] = useState({});

  // Initialize edited labels when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedLabels({ ...colorLabels });
    }
  }, [isOpen, colorLabels]);

  const handleLabelChange = (color, value) => {
    setEditedLabels((prev) => ({ ...prev, [color]: value }));
  };

  const handleReset = (color) => {
    setEditedLabels((prev) => ({
      ...prev,
      [color]: DEFAULT_COLOR_LABELS[color],
    }));
  };

  const handleResetAll = () => {
    setEditedLabels({ ...DEFAULT_COLOR_LABELS });
  };

  const handleSave = () => {
    onSave?.(editedLabels);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-composer-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-faint/30">
          <h2 className="font-display text-xl text-ink">Deck Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-ink transition-colors"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ink uppercase tracking-wide">
                Color Labels
              </h3>
              <button
                onClick={handleResetAll}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Reset all
              </button>
            </div>
            <p className="text-sm text-muted mb-4">
              Customize what each color represents in your story deck.
            </p>

            <div className="space-y-3">
              {COLOR_LIST.map(({ value, hex, defaultLabel }) => (
                <div key={value} className="flex items-center gap-3">
                  {/* Color dot */}
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />

                  {/* Label input */}
                  <input
                    type="text"
                    value={editedLabels[value] || ''}
                    onChange={(e) => handleLabelChange(value, e.target.value)}
                    placeholder={defaultLabel}
                    className="flex-1 px-3 py-2 text-sm bg-cream/50 rounded-lg border border-transparent focus:border-faint focus:outline-none"
                  />

                  {/* Reset button (only if different from default) */}
                  {editedLabels[value] !== defaultLabel && (
                    <button
                      onClick={() => handleReset(value)}
                      className="text-xs text-muted hover:text-ink transition-colors"
                      title="Reset to default"
                    >
                      <ResetIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-faint/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-ink text-cream rounded-lg hover:bg-ink/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default SettingsModal;
