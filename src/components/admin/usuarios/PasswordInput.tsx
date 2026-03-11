import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '••••••••',
  showStrength = true,
  showRequirements = true,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const requirements = useMemo(() => {
    return [
      { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
      { label: 'Uma letra maiúscula', met: /[A-Z]/.test(value) },
      { label: 'Um número', met: /[0-9]/.test(value) },
      { label: 'Um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(value) },
    ];
  }, [value]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: '', color: '' };
    if (metCount === 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (metCount === 2) return { level: 2, label: 'Razoável', color: 'bg-orange-500' };
    if (metCount === 3) return { level: 3, label: 'Boa', color: 'bg-yellow-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  }, [requirements]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('pr-10', error && 'border-destructive')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  level <= strength.level ? strength.color : 'bg-muted'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Força: <span className="font-medium">{strength.label}</span>
          </p>
        </div>
      )}

      {showRequirements && value && (
        <ul className="space-y-1">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                req.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordInput;
