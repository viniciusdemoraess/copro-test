import React from 'react';
import { Users, UserPlus, Mic, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import CandidatosChart from '@/components/admin/dashboard/CandidatosChart';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const stats = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a), {profile?.full_name || 'Usuário'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          icon={Users}
          iconColor="text-primary"
          iconBgColor="bg-green-100"
          value={stats.totalCandidatos}
          label="Total de Candidatos"
          subtext="Desde o início"
          delay={0}
        />
        <StatsCard
          icon={UserPlus}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          value={stats.novosCandidatos}
          label="Novos Candidatos"
          subtext="Últimos 7 dias"
          trend={{ value: 12, isPositive: true }}
          delay={100}
        />
        <StatsCard
          icon={Mic}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          value={stats.totalPodcasts}
          label="Podcasts Ativos"
          subtext="Disponíveis no site"
          delay={200}
        />
        <StatsCard
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          value={stats.totalCards}
          label="Cards Informativos"
          subtext="Publicados"
          delay={300}
        />
      </div>

      {/* Chart */}
      <CandidatosChart loading={stats.loading} />
    </div>
  );
};

export default Dashboard;
