import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CandidatoStatus, STATUS_CONFIG } from '@/types/candidato';

interface BulkActionsProps {
  selectedCount: number;
  onStatusChange: (status: CandidatoStatus) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActions({
  selectedCount,
  onStatusChange,
  onDelete,
  onClear,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <span className="text-sm font-medium">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>
      
      <Select onValueChange={(v) => onStatusChange(v as CandidatoStatus)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alterar status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        Excluir
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onClear}>
        Limpar seleção
      </Button>
    </div>
  );
}
