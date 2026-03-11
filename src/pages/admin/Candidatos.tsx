import React, { useState, useMemo } from 'react';
import { Users, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CandidatosStats } from '@/components/admin/candidatos/CandidatosStats';
import { CandidatosFilters } from '@/components/admin/candidatos/CandidatosFilters';
import { CandidatosTable } from '@/components/admin/candidatos/CandidatosTable';
import { CandidatoModal } from '@/components/admin/candidatos/CandidatoModal';
import { Pagination } from '@/components/admin/candidatos/Pagination';
import { BulkActions } from '@/components/admin/candidatos/BulkActions';
import { ExportButton } from '@/components/admin/candidatos/ExportButton';
import { TermosUploadModal } from '@/components/admin/candidatos/TermosUploadModal';
import { Button } from '@/components/ui/button';
import { Candidato, CandidatosFilters as FiltersType, CandidatoStatus } from '@/types/candidato';
import {
  useCandidatos,
  useCandidatosStats,
  useCandidatosCities,
  useDeleteCandidato,
  useBulkUpdateStatus,
  useBulkDeleteCandidatos,
} from '@/hooks/useCandidatos';
import { useAuth } from '@/contexts/AuthContext';

// Simple debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function Candidatos() {
  const { user } = useAuth();

  // Filters state
  const [filters, setFilters] = useState<FiltersType>({
    search: '',
    status: 'all',
    city: 'all',
    dateFrom: null,
    dateTo: null,
  });

  // Debounced search
  const debouncedFilters = useDebounceValue(filters, 500);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [viewingCandidato, setViewingCandidato] = useState<Candidato | null>(null);
  const [deletingCandidato, setDeletingCandidato] = useState<Candidato | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showTermosModal, setShowTermosModal] = useState(false);

  // Queries
  const { data, isLoading } = useCandidatos(debouncedFilters, page, pageSize);
  const { data: stats, isLoading: statsLoading } = useCandidatosStats();
  const { data: cities } = useCandidatosCities();

  // Mutations
  const deleteMutation = useDeleteCandidato();
  const bulkStatusMutation = useBulkUpdateStatus();
  const bulkDeleteMutation = useBulkDeleteCandidatos();

  // Selected candidatos data
  const selectedCandidatos = useMemo(() => {
    if (!data) return [];
    return data.candidatos.filter(c => selectedIds.includes(c.id));
  }, [data, selectedIds]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [debouncedFilters]);

  const handleDelete = async () => {
    if (deletingCandidato) {
      await deleteMutation.mutateAsync(deletingCandidato.id);
      setDeletingCandidato(null);
      setSelectedIds(prev => prev.filter(id => id !== deletingCandidato.id));
    }
  };

  const handleBulkStatusChange = (status: CandidatoStatus) => {
    if (!user || selectedIds.length === 0) return;
    bulkStatusMutation.mutate({
      ids: selectedIds,
      status,
      userId: user.id,
    });
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" />
            Cooperados
          </h1>
          <p className="text-muted-foreground">
            Gerencie as candidaturas de associação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTermosModal(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Termos
          </Button>
          <ExportButton
            currentPageCandidatos={data?.candidatos || []}
            selectedCandidatos={selectedCandidatos}
          />
        </div>
      </div>

      {/* Stats */}
      <CandidatosStats stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <CandidatosFilters
        filters={filters}
        onFiltersChange={setFilters}
        cities={cities || []}
        totalResults={data?.total || 0}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.length}
        onStatusChange={handleBulkStatusChange}
        onDelete={() => setShowBulkDeleteConfirm(true)}
        onClear={() => setSelectedIds([])}
      />

      {/* Table */}
      <CandidatosTable
        candidatos={data?.candidatos || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={setViewingCandidato}
        onDelete={setDeletingCandidato}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        totalItems={data?.total || 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* View Modal */}
      <CandidatoModal
        candidato={viewingCandidato}
        isOpen={!!viewingCandidato}
        onClose={() => setViewingCandidato(null)}
      />

      {/* Delete Single Confirmation */}
      <AlertDialog open={!!deletingCandidato} onOpenChange={() => setDeletingCandidato(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o candidato "{deletingCandidato?.full_name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedIds.length} candidatos?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir {selectedIds.length} candidatos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Termos Upload Modal */}
      <TermosUploadModal
        isOpen={showTermosModal}
        onClose={() => setShowTermosModal(false)}
      />
    </div>
  );
}
