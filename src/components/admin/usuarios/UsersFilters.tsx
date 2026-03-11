import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UsersFilters as FiltersType, UserRole } from '@/types/user';

interface UsersFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({ filters, onChange }) => {
  const hasActiveFilters = filters.search || filters.role !== 'all' || filters.status !== 'all';

  const clearFilters = () => {
    onChange({
      search: '',
      role: 'all',
      status: 'all',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Select
        value={filters.role}
        onValueChange={(value) => onChange({ ...filters, role: value as UserRole | 'all' })}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Permissão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value as 'all' | 'active' | 'inactive' })}
      >
        <SelectTrigger className="w-full sm:w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
};

export default UsersFilters;
