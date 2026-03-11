import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useCarouselSlides, useDeleteSlide, useUpdateSlide, useReorderSlides } from '@/hooks/useCarouselSlides';
import { useImageUpload } from '@/hooks/useImageUpload';
import CarouselSlideRow from './CarouselSlideRow';
import CarouselSlideModal from './CarouselSlideModal';
import type { CarouselSlide } from '@/types/media';

const CarouselList: React.FC = () => {
  const { toast } = useToast();
  const { data: slides = [], isLoading, error } = useCarouselSlides();
  const deleteSlide = useDeleteSlide();
  const updateSlide = useUpdateSlide();
  const reorderSlides = useReorderSlides();
  const { deleteImage } = useImageUpload();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CarouselSlide | null>(null);
  const [localSlides, setLocalSlides] = useState<CarouselSlide[]>([]);

  // Sync local slides with fetched data
  React.useEffect(() => {
    if (slides) {
      setLocalSlides(slides);
    }
  }, [slides]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localSlides.findIndex((s) => s.id === active.id);
      const newIndex = localSlides.findIndex((s) => s.id === over?.id);

      // Optimistic update
      const newSlides = arrayMove(localSlides, oldIndex, newIndex);
      setLocalSlides(newSlides);

      try {
        await reorderSlides.mutateAsync({
          slideId: active.id as string,
          newPosition: newIndex + 1,
        });
        toast({ title: 'Ordem atualizada' });
      } catch (error) {
        // Revert on error
        setLocalSlides(slides || []);
        toast({
          title: 'Erro ao reordenar',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSlide(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleToggleActive = async (slide: CarouselSlide) => {
    try {
      await updateSlide.mutateAsync({
        id: slide.id,
        active: !slide.active,
      });
      toast({
        title: slide.active ? 'Slide desativado' : 'Slide ativado',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      // Delete image from storage
      await deleteImage(deleteConfirm.image_url);

      // Delete from database
      await deleteSlide.mutateAsync(deleteConfirm.id);

      toast({ title: 'Slide excluído com sucesso' });
    } catch (error) {
      toast({
        title: 'Erro ao excluir slide',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar slides</p>
      </div>
    );
  }

  const nextPosition = (slides?.length || 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Carrossel</h1>
          <p className="text-muted-foreground">
            Organize e gerencie os banners do carrossel principal
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Slide
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-20 rounded-lg" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : localSlides.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ImageOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            Nenhum slide cadastrado
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece adicionando o primeiro banner ao carrossel
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Slide
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-24">Preview</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-48">Link</TableHead>
                  <TableHead className="w-20 text-center">Ordem</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={localSlides.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {localSlides.map((slide) => (
                    <CarouselSlideRow
                      key={slide.id}
                      slide={slide}
                      onEdit={handleEdit}
                      onDelete={setDeleteConfirm}
                      onToggleActive={handleToggleActive}
                      isDraggable={localSlides.length > 1}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
      )}

      {/* Modal */}
      <CarouselSlideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        slide={editingSlide}
        nextPosition={nextPosition}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o slide "{deleteConfirm?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Slide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CarouselList;
