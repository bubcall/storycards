import { useState, useEffect } from 'react';
import {
  CATEGORY_LIST,
  CARD_CONSTRAINTS,
  getCategoryColor,
} from '../lib/constants';

/**
 * CardForm - Form for creating and editing cards
 *
 * @param {Object} props
 * @param {Object} props.card - Card to edit (null for new card)
 * @param {function} props.onSave - Callback when form is saved
 * @param {function} props.onCancel - Callback when form is cancelled
 */
function CardForm({ card = null, onSave, onCancel }) {
  const isEditing = card !== null;

  const [formData, setFormData] = useState({
    category: card?.category || CATEGORY_LIST[0].value,
    title: card?.title || '',
    body: card?.body || '',
    characters: card?.characters?.join(', ') || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when card changes
  useEffect(() => {
    setFormData({
      category: card?.category || CATEGORY_LIST[0].value,
      title: card?.title || '',
      body: card?.body || '',
      characters: card?.characters?.join(', ') || '',
    });
    setErrors({});
    setTouched({});
  }, [card]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > CARD_CONSTRAINTS.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be ${CARD_CONSTRAINTS.TITLE_MAX_LENGTH} characters or less`;
    }

    if (formData.body.length > CARD_CONSTRAINTS.BODY_MAX_LENGTH) {
      newErrors.body = `Body must be ${CARD_CONSTRAINTS.BODY_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      setTouched({ title: true, body: true });
      return;
    }

    // Parse characters from comma-separated string
    const characters = formData.characters
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    onSave?.({
      ...(card && { id: card.id }),
      category: formData.category,
      title: formData.title.trim(),
      body: formData.body.trim(),
      characters,
    });
  };

  const selectedCategoryColor = getCategoryColor(formData.category);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category selector */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Category
        </label>
        <div className="relative">
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-faint rounded-lg text-ink appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: selectedCategoryColor,
            }}
          >
            {CATEGORY_LIST.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      {/* Title input */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Card title..."
          maxLength={CARD_CONSTRAINTS.TITLE_MAX_LENGTH}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot ${
            errors.title && touched.title
              ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
              : 'border-faint'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.title && touched.title ? (
            <span className="text-xs text-red-500">{errors.title}</span>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">
            {formData.title.length}/{CARD_CONSTRAINTS.TITLE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Body textarea */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Body
        </label>
        <textarea
          value={formData.body}
          onChange={(e) => handleChange('body', e.target.value)}
          onBlur={() => handleBlur('body')}
          placeholder="Describe this beat..."
          rows={4}
          maxLength={CARD_CONSTRAINTS.BODY_MAX_LENGTH}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-ink placeholder:text-faint resize-none focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot ${
            errors.body && touched.body
              ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
              : 'border-faint'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.body && touched.body ? (
            <span className="text-xs text-red-500">{errors.body}</span>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">
            {formData.body.length}/{CARD_CONSTRAINTS.BODY_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Characters input */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Characters
        </label>
        <input
          type="text"
          value={formData.characters}
          onChange={(e) => handleChange('characters', e.target.value)}
          placeholder="Elena, Marcus, The Stranger..."
          className="w-full px-3 py-2 bg-white border border-faint rounded-lg text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-plot/30 focus:border-plot"
        />
        <p className="text-xs text-muted mt-1">
          Separate multiple characters with commas
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors"
        >
          {isEditing ? 'Update Card' : 'Add Card'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-cream border border-faint text-muted rounded-lg font-medium hover:bg-faint/20 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default CardForm;
