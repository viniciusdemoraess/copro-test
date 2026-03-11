import React from 'react';
import { Users, Shield, Edit, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UsersStats as StatsType } from '@/types/user';

interface UsersStatsProps {
  stats: StatsType;
}

const UsersStats: React.FC<UsersStatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total de Usuários',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Administradores',
      value: stats.admins,
      icon: Shield,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      label: 'Editores',
      value: stats.editors,
      icon: Edit,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Ativos',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UsersStats;
