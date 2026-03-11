import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryTabs } from '@/components/admin/info-cards/CategoryTabs';
import { InfoCardsGrid } from '@/components/admin/info-cards/InfoCardsGrid';
import { InfoCardModal } from '@/components/admin/info-cards/InfoCardModal';
import { InfoCard, InfoCardCategory, categoryTabs } from '@/types/info-card';
import {
  useInfoCardsAdmin,
  useInfoCardStats,
  useDeleteInfoCard,
  useToggleInfoCardStatus,
  useDuplicateInfoCard,
} from '@/hooks/useInfoCards';

export default function CardsInformativos() {
  const [activeCategory, setActiveCategory] = useState<InfoCardCategory>('servico');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<InfoCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<InfoCard | null>(null);

  const { data: cards, isLoading } = useInfoCardsAdmin();
  const stats = useInfoCardStats();
  const deleteMutation = useDeleteInfoCard();
  const toggleMutation = useToggleInfoCardStatus();
  const duplicateMutation = useDuplicateInfoCard();

  const currentCategoryInfo = categoryTabs.find(c => c.id === activeCategory);

  const handleAdd = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEdit = (card: InfoCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingCard) {
      await deleteMutation.mutateAsync(deletingCard.id);
      setDeletingCard(null);
    }
  };

  const handleDuplicate = (card: InfoCard) => {
    duplicateMutation.mutate(card);
  };

  const handleToggleStatus = (id: string, active: boolean) => {
    toggleMutation.mutate({ id, active });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cards Informativos</h1>
          <p className="text-muted-foreground">
            Gerencie cards de benefícios, serviços e informações gerais
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Card
        </Button>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        stats={stats}
      />

      {/* Category Info */}
      {currentCategoryInfo && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText className="w-5 h-5" />
          <span>{currentCategoryInfo.description}</span>
          <span className="text-sm">
            ({stats[activeCategory]?.active || 0} ativos de {stats[activeCategory]?.total || 0})
          </span>
        </div>
      )}

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : (
        <InfoCardsGrid
          cards={cards || []}
          category={activeCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={setDeletingCard}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add/Edit Modal */}
      <InfoCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        editingCard={editingCard}
        defaultCategory={activeCategory}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCard} onOpenChange={() => setDeletingCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o card "{deletingCard?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
