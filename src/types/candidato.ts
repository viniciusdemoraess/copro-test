export type CandidatoStatus = 'novo' | 'em_analise' | 'aprovado' | 'rejeitado';

export interface Candidato {
  id: string;
  cpf: string;
  rg: string | null;
  rg_orgao: string | null;
  full_name: string;
  birth_date: string | null;
  nationality: string | null;
  marital_status: string | null;
  profession: string | null;
  phones: { numero: string; whatsapp: boolean }[];
  whatsapp: string | null;
  email: string;
  email_confirmation: string | null;
  secondary_emails: string[];
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  terms_accepted: boolean;
  status: CandidatoStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidatoHistory {
  id: string;
  candidato_id: string;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
  };
}

export interface CandidatosStats {
  total: number;
  novos: number;
  emAnalise: number;
  aprovados: number;
  rejeitados: number;
  ultimos7Dias: number;
  ultimos30Dias: number;
}

export interface CandidatosFilters {
  search: string;
  status: CandidatoStatus | 'all';
  city: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}

export const STATUS_CONFIG = {
  novo: {
    label: 'Novo',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  em_analise: {
    label: 'Em Análise',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'bg-green-100 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
} as const;
