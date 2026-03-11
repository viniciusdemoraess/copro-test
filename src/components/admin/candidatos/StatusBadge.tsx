import React from 'react';
import { cn } from '@/lib/utils';
import { CandidatoStatus, STATUS_CONFIG } from '@/types/candidato';

interface StatusBadgeProps {
  status: CandidatoStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}
