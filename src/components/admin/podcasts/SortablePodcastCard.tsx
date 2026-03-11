import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PodcastCard from './PodcastCard';
import { Podcast } from '@/types/podcast';

interface SortablePodcastCardProps {
  podcast: Podcast;
  isDragEnabled: boolean;
  onEdit: (podcast: Podcast) => void;
}

const SortablePodcastCard: React.FC<SortablePodcastCardProps> = ({
  podcast,
  isDragEnabled,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: podcast.id,
    disabled: !isDragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PodcastCard
        podcast={podcast}
        isDragEnabled={isDragEnabled}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
      />
    </div>
  );
};

export default SortablePodcastCard;
