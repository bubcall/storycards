import { COLOR_LIST, getColorLabel } from '../lib/constants';
import useDeckStore from '../store/deckStore';

/**
 * ColorSelector component - 10 color dots for selecting card color
 *
 * @param {Object} props
 * @param {string} props.selected - Currently selected color key
 * @param {function} props.onChange - Callback when color is selected
 */
function ColorSelector({ selected, onChange }) {
  const colorLabels = useDeckStore((state) => state.colorLabels);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {COLOR_LIST.map(({ value, hex }) => {
        const label = getColorLabel(value, colorLabels);
        const isSelected = selected === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`
              w-7 h-7 rounded-full transition-all duration-150
              ${isSelected
                ? 'ring-2 ring-offset-2 ring-ink/50 scale-110'
                : 'hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-faint'
              }
            `}
            style={{ backgroundColor: hex }}
            title={label}
            aria-label={`Select ${label} color`}
          />
        );
      })}
    </div>
  );
}

export default ColorSelector;
