import { LucideIcon } from 'lucide-react';

export interface DashboardStats {
  totalCandidatos: number;
  novosCandidatos: number;
  totalPodcasts: number;
  totalCards: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: MenuItem[];
  adminOnly?: boolean;
}

export interface CandidatosPorMes {
  mes: string;
  total: number;
}
