import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Mic, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SortablePodcastCard from './SortablePodcastCard';
import PodcastCard from './PodcastCard';
import PodcastFilters from './PodcastFilters';
import PodcastModal from './PodcastModal';
import { usePodcasts, usePodcastStats, useReorderPodcasts } from '@/hooks/usePodcasts';
import { Podcast, PodcastOrderBy, PodcastStatusFilter } from '@/types/podcast';

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const PodcastsGrid: React.FC<PodcastsGridProps> = ({ onOpenModal }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PodcastStatusFilter>('all');
  const [orderBy, setOrderBy] = useState<PodcastOrderBy>('manual');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: podcasts, isLoading } = usePodcasts({
    orderBy,
    statusFilter,
    search: debouncedSearch,
    adminView: true,
  });

  const { data: stats } = usePodcastStats();
  const reorderPodcasts = useReorderPodcasts();

  const isDragEnabled = orderBy === 'manual';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activePodcast = useMemo(() => {
    if (!activeId || !podcasts) return null;
    return podcasts.find((p) => p.id === activeId);
  }, [activeId, podcasts]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !podcasts) return;

    const oldIndex = podcasts.findIndex((p) => p.id === active.id);
    const newIndex = podcasts.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new position
    const newPosition = newIndex + 1;

    reorderPodcasts.mutate({
      podcastId: active.id as string,
      newPosition,
    });
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPodcast(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PodcastFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          orderBy={orderBy}
          onOrderByChange={setOrderBy}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !podcasts || podcasts.length === 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="text-sm text-muted-foreground">
          Total: {stats.total} • Ativos: {stats.active} • Inativos: {stats.inactive}
        </div>
      )}

      {/* Filters */}
      <PodcastFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        orderBy={orderBy}
        onOrderByChange={setOrderBy}
      />

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {debouncedSearch ? (
            <>
              <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Tente buscar com outros termos
              </p>
              <Button variant="outline" onClick={() => setSearch('')}>
                Limpar Busca
              </Button>
            </>
          ) : (
            <>
              <Mic className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum podcast cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Adicione episódios do YouTube para exibir nesta seção
              </p>
              <Button onClick={onOpenModal}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Podcast
              </Button>
            </>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={podcasts?.map((p) => p.id) || []}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {podcasts?.map((podcast) => (
                <SortablePodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  isDragEnabled={isDragEnabled}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activePodcast && (
              <div className="opacity-80">
                <PodcastCard
                  podcast={activePodcast}
                  isDragEnabled={false}
                  onEdit={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Edit Modal */}
      <PodcastModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        podcast={editingPodcast}
      />
    </div>
  );
};

interface PodcastsGridProps {
  onOpenModal: () => void;
}

export default PodcastsGrid;
