import React from 'react';
import { Shield, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';
import { ROLE_CONFIG } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const config = ROLE_CONFIG[role];
  const Icon = role === 'admin' ? Shield : Edit;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {config.label}
    </span>
  );
};

export default RoleBadge;
