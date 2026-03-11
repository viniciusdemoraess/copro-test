import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CarouselSlide } from '@/types/media';

interface CarouselSlideRowProps {
  slide: CarouselSlide;
  onEdit: (slide: CarouselSlide) => void;
  onDelete: (slide: CarouselSlide) => void;
  onToggleActive: (slide: CarouselSlide) => void;
  isDraggable: boolean;
}

const CarouselSlideRow: React.FC<CarouselSlideRowProps> = ({
  slide,
  onEdit,
  onDelete,
  onToggleActive,
  isDraggable,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b border-border hover:bg-muted/50 transition-colors',
        isDragging && 'opacity-50 bg-muted'
      )}
    >
      {/* Drag Handle */}
      <td className="w-10 px-2">
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}
      </td>

      {/* Preview */}
      <td className="w-24 py-3 px-2">
        <div className="w-20 h-12 rounded-lg overflow-hidden border border-border">
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      </td>

      {/* Title */}
      <td className="py-3 px-4">
        <div className="max-w-xs">
          <p className="font-medium text-foreground truncate">{slide.title}</p>
          {slide.subtitle && (
            <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>
          )}
        </div>
      </td>

      {/* Link */}
      <td className="py-3 px-4 w-48">
        {slide.link_url ? (
          <a
            href={slide.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline truncate"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{slide.link_url}</span>
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Sem link</span>
        )}
      </td>

      {/* Order */}
      <td className="py-3 px-4 w-20 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-muted rounded-full text-sm font-medium text-foreground">
          {slide.order_position}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4 w-24">
        <Switch
          checked={slide.active}
          onCheckedChange={() => onToggleActive(slide)}
          aria-label={slide.active ? 'Desativar' : 'Ativar'}
        />
      </td>

      {/* Actions */}
      <td className="py-3 px-4 w-24">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(slide)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar slide</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(slide)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir slide</TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};

export default CarouselSlideRow;
