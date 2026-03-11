import React from 'react';
import { Eye, MoreVertical, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Candidato } from '@/types/candidato';
import { StatusBadge } from './StatusBadge';
import { formatCPF, formatPhone, formatRelativeDate } from '@/lib/format-utils';

interface CandidatosTableProps {
  candidatos: Candidato[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onView: (candidato: Candidato) => void;
  onDelete: (candidato: Candidato) => void;
}

export function CandidatosTable({
  candidatos,
  isLoading,
  selectedIds,
  onSelectionChange,
  onView,
  onDelete,
}: CandidatosTableProps) {
  const allSelected = candidatos.length > 0 && selectedIds.length === candidatos.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < candidatos.length;
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(candidatos.map(c => c.id));
    } else {
      onSelectionChange([]);
    }
  };
  
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(i => i !== id));
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (candidatos.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <p className="text-muted-foreground">Nenhum candidato encontrado</p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Selecionar todos"
                className={someSelected ? 'opacity-50' : ''}
              />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Município</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidatos.map((candidato) => {
            const phone = candidato.whatsapp || 
              (candidato.phones && candidato.phones[0]?.numero) || 
              '-';
            
            return (
              <TableRow key={candidato.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(candidato.id)}
                    onCheckedChange={(checked) => handleSelectOne(candidato.id, !!checked)}
                    aria-label={`Selecionar ${candidato.full_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{candidato.full_name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {formatCPF(candidato.cpf)}
                </TableCell>
                <TableCell className="text-sm">{candidato.email}</TableCell>
                <TableCell className="text-sm">
                  {phone !== '-' ? formatPhone(phone) : '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {candidato.city ? `${candidato.city}/${candidato.state}` : '-'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={candidato.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeDate(candidato.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(candidato)}
                      className="h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(candidato)}>
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(candidato)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
