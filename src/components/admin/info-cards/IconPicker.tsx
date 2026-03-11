import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { COMMON_ICONS } from '@/types/info-card';

interface IconPickerProps {
  selected?: string;
  onSelect: (iconName: string) => void;
  iconColor?: string;
}

export function IconPicker({ selected, onSelect, iconColor = '#0e873d' }: IconPickerProps) {
  const [search, setSearch] = useState('');
  
  const filteredIcons = useMemo(() => {
    if (!search) return COMMON_ICONS;
    return COMMON_ICONS.filter(name =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ícone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-1">
        {filteredIcons.map(iconName => {
          const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
          if (!Icon) return null;
          
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              title={iconName}
              className={cn(
                "p-3 border-2 rounded-lg hover:bg-muted transition-colors",
                selected === iconName 
                  ? "border-primary bg-primary/10" 
                  : "border-border"
              )}
            >
              <Icon 
                className="w-5 h-5 mx-auto" 
                style={{ color: selected === iconName ? iconColor : undefined }}
              />
            </button>
          );
        })}
      </div>
      
      {filteredIcons.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum ícone encontrado
        </p>
      )}
    </div>
  );
}
