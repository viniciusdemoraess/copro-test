export interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  description: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
}
