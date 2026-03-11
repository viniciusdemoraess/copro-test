import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PodcastOrderBy, PodcastStatusFilter } from '@/types/podcast';

interface PodcastFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: PodcastStatusFilter;
  onStatusFilterChange: (value: PodcastStatusFilter) => void;
  orderBy: PodcastOrderBy;
  onOrderByChange: (value: PodcastOrderBy) => void;
}

const PodcastFilters: React.FC<PodcastFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  orderBy,
  onOrderByChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={orderBy} onValueChange={onOrderByChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Ordem Manual</SelectItem>
          <SelectItem value="newest">Mais Recentes</SelectItem>
          <SelectItem value="oldest">Mais Antigos</SelectItem>
          <SelectItem value="az">A-Z</SelectItem>
          <SelectItem value="za">Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PodcastFilters;
