import React from 'react';
import * as Icons from 'lucide-react';
import { GripVertical, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { InfoCard } from '@/types/info-card';

interface InfoCardItemProps {
  card: InfoCard;
  onEdit: (card: InfoCard) => void;
  onDelete: (card: InfoCard) => void;
  onDuplicate: (card: InfoCard) => void;
  onToggleStatus: (id: string, active: boolean) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function InfoCardItem({
  card,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isDragging,
  dragHandleProps,
}: InfoCardItemProps) {
  const Icon = card.icon_name 
    ? (Icons[card.icon_name as keyof typeof Icons] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>)
    : null;
  
  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 transition-all group hover:shadow-md",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <div 
        className="flex justify-center mb-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...dragHandleProps}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Icon or Image */}
      <div className="flex justify-center mb-3">
        {card.image_url ? (
          <img 
            src={card.image_url} 
            alt={card.title}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : Icon ? (
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${card.icon_color}20` }}
          >
            <Icon 
              className="w-7 h-7" 
              style={{ color: card.icon_color }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-muted" />
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-semibold text-center text-foreground line-clamp-2 mb-2 min-h-[40px]">
        {card.title}
      </h3>
      
      {/* Status and Order */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={card.active}
            onCheckedChange={(checked) => onToggleStatus(card.id, checked)}
            className="scale-75"
          />
          <span className={cn(
            "text-xs",
            card.active ? "text-green-600" : "text-muted-foreground"
          )}>
            {card.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          #{card.order_position}
        </Badge>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-3 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(card)}
          className="h-8 text-muted-foreground hover:text-primary"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(card)}
          className="h-8 text-muted-foreground hover:text-blue-600"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(card)}
          className="h-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
