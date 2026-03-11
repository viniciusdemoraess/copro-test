import React from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CandidatosFilters as FiltersType, STATUS_CONFIG } from '@/types/candidato';

interface CandidatosFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  cities: string[];
  totalResults: number;
}

export function CandidatosFilters({
  filters,
  onFiltersChange,
  cities,
  totalResults,
}: CandidatosFiltersProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'all' || 
    filters.city !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;
  
  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      city: 'all',
      dateFrom: null,
      dateTo: null,
    });
  };
  
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou email..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* City */}
        <Select
          value={filters.city}
          onValueChange={(value) => onFiltersChange({ ...filters, city: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os municípios</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Date range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || null })}
            className="w-[140px]"
            placeholder="De"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || null })}
            className="w-[140px]"
            placeholder="Até"
          />
        </div>
        
        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
        )}
        
        {/* Results count */}
        <div className="flex items-center ml-auto text-sm text-muted-foreground">
          Resultados: {totalResults.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
