import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InfoCard } from '@/types/info-card';
import { InfoCardItem } from './InfoCardItem';

interface SortableInfoCardProps {
  card: InfoCard;
  onEdit: (card: InfoCard) => void;
  onDelete: (card: InfoCard) => void;
  onDuplicate: (card: InfoCard) => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export function SortableInfoCard({
  card,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: SortableInfoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <InfoCardItem
        card={card}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleStatus={onToggleStatus}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}
