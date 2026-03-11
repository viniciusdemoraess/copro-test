export type UserRole = 'admin' | 'editor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_active: boolean;
  last_login: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends UserProfile {
  role: UserRole;
}

export interface UserFormData {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  bio?: string;
  role: UserRole;
  is_active: boolean;
}

export interface UsersStats {
  total: number;
  admins: number;
  editors: number;
  active: number;
  inactive: number;
}

export interface UsersFilters {
  search: string;
  role: UserRole | 'all';
  status: 'all' | 'active' | 'inactive';
}

export const ROLE_CONFIG = {
  admin: {
    label: 'Administrador',
    description: 'Acesso total ao sistema',
    color: 'text-amber-700 bg-amber-100',
    permissions: [
      'Gerenciar mídias',
      'Gerenciar podcasts',
      'Gerenciar cards',
      'Ver e editar candidatos',
      'Excluir candidatos',
      'Gerenciar usuários',
      'Ver logs de auditoria',
    ],
  },
  editor: {
    label: 'Editor',
    description: 'Pode gerenciar conteúdo',
    color: 'text-blue-700 bg-blue-100',
    permissions: [
      'Gerenciar mídias',
      'Gerenciar podcasts',
      'Gerenciar cards',
      'Ver e editar candidatos',
    ],
  },
} as const;
