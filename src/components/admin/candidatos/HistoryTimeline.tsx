import React from 'react';
import { Clock, Edit, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CandidatoHistory } from '@/types/candidato';
import { formatFullDate } from '@/lib/format-utils';
import { cn } from '@/lib/utils';

interface HistoryTimelineProps {
  history: CandidatoHistory[];
  isLoading: boolean;
}

function getHistoryIcon(actionType: string) {
  switch (actionType) {
    case 'status_change':
      return <AlertCircle className="w-4 h-4" />;
    case 'note_updated':
      return <Edit className="w-4 h-4" />;
    case 'created':
      return <FileText className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getHistoryColor(actionType: string) {
  switch (actionType) {
    case 'status_change':
      return 'bg-blue-100 text-blue-600';
    case 'note_updated':
      return 'bg-yellow-100 text-yellow-600';
    case 'created':
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getHistoryText(item: CandidatoHistory): string {
  switch (item.action_type) {
    case 'status_change':
      return `Status alterado: ${item.old_value || '?'} → ${item.new_value}`;
    case 'note_updated':
      return 'Notas atualizadas';
    case 'created':
      return 'Candidatura enviada';
    default:
      return item.action_type;
  }
}

export function HistoryTimeline({ history, isLoading }: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }
  
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum histórico registrado
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              getHistoryColor(item.action_type)
            )}>
              {getHistoryIcon(item.action_type)}
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>
          
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-foreground">
              {getHistoryText(item)}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.user?.full_name && `Por: ${item.user.full_name} • `}
              {formatFullDate(item.created_at)}
            </p>
            {item.notes && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                "{item.notes}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
