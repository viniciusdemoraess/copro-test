import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  isActive: boolean;
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive, showLabel = true }) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isActive ? 'bg-green-500' : 'bg-gray-400'
        )}
      />
      {showLabel && (
        <span className={cn(
          'text-sm',
          isActive ? 'text-green-700' : 'text-muted-foreground'
        )}>
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
