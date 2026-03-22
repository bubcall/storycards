import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';

/**
 * SortableCard - Wraps Card component with dnd-kit sortable functionality
 *
 * @param {Object} props - All Card props plus sortable behavior
 */
function SortableCard({ id, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      id={id}
      style={style}
      isDragging={isDragging}
      isOver={isOver}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...props}
    />
  );
}

export default SortableCard;
