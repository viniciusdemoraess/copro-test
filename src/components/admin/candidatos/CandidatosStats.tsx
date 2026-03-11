import React from 'react';
import { Users, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CandidatosStats as StatsType } from '@/types/candidato';

interface CandidatosStatsProps {
  stats: StatsType | undefined;
  isLoading: boolean;
}

export function CandidatosStats({ stats, isLoading }: CandidatosStatsProps) {
  const cards = [
    {
      label: 'Total de Cooperados',
      value: stats?.total ?? 0,
      subtitle: 'Desde o início',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Novos Cooperados',
      value: stats?.ultimos7Dias ?? 0,
      subtitle: 'Últimos 7 dias',
      icon: UserPlus,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Em Análise',
      value: stats?.emAnalise ?? 0,
      subtitle: 'Aguardando revisão',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Aprovados',
      value: stats?.aprovados ?? 0,
      subtitle: stats ? `Taxa: ${((stats.aprovados / stats.total) * 100 || 0).toFixed(0)}%` : '-',
      icon: CheckCircle,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {card.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
