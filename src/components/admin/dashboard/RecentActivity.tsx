import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import EmptyState from './EmptyState';
import type { Activity as ActivityType } from '@/types/activity';

const RecentActivity: React.FC = () => {
  const { activities, loading, error } = useRecentActivity(10);

  const getActionIcon = (action: ActivityType['action']) => {
    switch (action) {
      case 'create':
        return { icon: Plus, color: 'text-green-600', bg: 'bg-green-100' };
      case 'update':
        return { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'delete':
        return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Erro ao carregar atividades</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          Atividades Recentes
        </CardTitle>
        {activities.length > 0 && (
          <button className="text-sm text-primary hover:underline">
            Ver todas
          </button>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nenhuma atividade recente"
            description="As ações realizadas aparecerão aqui"
          />
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => {
              const { icon: Icon, color, bg } = getActionIcon(activity.action);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      bg
                    )}
                  >
                    <Icon className={cn('h-4 w-4', color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-help">
                          {formatTimestamp(activity.createdAt)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatFullDate(activity.createdAt)}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
