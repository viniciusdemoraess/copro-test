import React from 'react';
import { Shield, Edit, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';
import { ROLE_CONFIG } from '@/types/user';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled }) => {
  const roles: { value: UserRole; icon: React.ElementType }[] = [
    { value: 'editor', icon: Edit },
    { value: 'admin', icon: Shield },
  ];

  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const config = ROLE_CONFIG[role.value];
        const isSelected = value === role.value;

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => !disabled && onChange(role.value)}
            disabled={disabled}
            className={cn(
              'w-full p-4 border-2 rounded-lg text-left transition-all',
              isSelected
                ? 'border-primary bg-green-50'
                : 'border-border hover:border-muted-foreground/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{config.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {config.description}
                </p>
                
                <ul className="mt-2 space-y-1">
                  {config.permissions.slice(0, 4).map((perm) => (
                    <li key={perm} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {perm}
                    </li>
                  ))}
                  {config.permissions.length > 4 && (
                    <li className="text-xs text-muted-foreground">
                      +{config.permissions.length - 4} permissões...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
