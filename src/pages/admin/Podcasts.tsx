import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastsGrid from '@/components/admin/podcasts/PodcastsGrid';
import PodcastModal from '@/components/admin/podcasts/PodcastModal';

const Podcasts: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Podcasts</h1>
          <p className="text-muted-foreground">
            Adicione e organize os episódios exibidos no site
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Podcast
        </Button>
      </div>

      {/* Grid */}
      <PodcastsGrid onOpenModal={() => setIsModalOpen(true)} />

      {/* Create Modal */}
      <PodcastModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Podcasts;
