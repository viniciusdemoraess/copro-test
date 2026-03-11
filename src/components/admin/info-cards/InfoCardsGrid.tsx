import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoCard, InfoCardCategory } from '@/types/info-card';
import { SortableInfoCard } from './SortableInfoCard';
import { InfoCardItem } from './InfoCardItem';
import { useReorderInfoCards } from '@/hooks/useInfoCards';

interface InfoCardsGridProps {
  cards: InfoCard[];
  category: InfoCardCategory;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onEdit: (card: InfoCard) => void;
  onDelete: (card: InfoCard) => void;
  onDuplicate: (card: InfoCard) => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export function InfoCardsGrid({
  cards,
  category,
  searchQuery,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: InfoCardsGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localCards, setLocalCards] = useState<InfoCard[]>([]);
  const reorderMutation = useReorderInfoCards();
  
  // Filter cards by category and search
  const filteredCards = useMemo(() => {
    let filtered = cards.filter(c => c.category === category);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c => c.title.toLowerCase().includes(query) ||
             c.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [cards, category, searchQuery]);
  
  // Use local state for optimistic updates
  const displayCards = localCards.length > 0 ? localCards : filteredCards;
  
  React.useEffect(() => {
    setLocalCards([]);
  }, [filteredCards]);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = filteredCards.findIndex(c => c.id === active.id);
    const newIndex = filteredCards.findIndex(c => c.id === over.id);
    
    // Optimistic update
    const newCards = arrayMove(filteredCards, oldIndex, newIndex);
    setLocalCards(newCards);
    
    try {
      await reorderMutation.mutateAsync({
        cardId: active.id as string,
        newPosition: newIndex + 1,
      });
    } catch {
      // Revert on error
      setLocalCards([]);
    }
  };
  
  const activeCard = activeId ? displayCards.find(c => c.id === activeId) : null;
  
  if (filteredCards.length === 0 && !searchQuery) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum card nesta categoria</h3>
        <p className="text-muted-foreground mb-6">
          Comece adicionando o primeiro card
        </p>
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Card
        </Button>
      </div>
    );
  }
  
  if (filteredCards.length === 0 && searchQuery) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Tente buscar com outros termos
        </p>
        <Button variant="outline" onClick={() => onSearchChange('')}>
          Limpar busca
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por título ou descrição..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>
      
      {/* Grid */}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayCards.map(c => c.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayCards.map(card => (
              <SortableInfoCard
                key={card.id}
                card={card}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeCard ? (
            <InfoCardItem
              card={activeCard}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
              onToggleStatus={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
