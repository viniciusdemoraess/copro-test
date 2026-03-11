import React, { useState } from 'react';
import { Plus, VideoOff } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  useFeaturedVideo,
  useCreateFeaturedVideo,
  useUpdateFeaturedVideo,
  useDeleteFeaturedVideo,
} from '@/hooks/useFeaturedVideo';
import FeaturedVideoCard from '@/components/admin/midias/video-destaque/FeaturedVideoCard';
import FeaturedVideoModal from '@/components/admin/midias/video-destaque/FeaturedVideoModal';
import type { FeaturedVideo } from '@/types/media';

const VideoDestaque: React.FC = () => {
  const { toast } = useToast();
  const { data: videos, isLoading } = useFeaturedVideo(false);
  const createVideo = useCreateFeaturedVideo();
  const updateVideo = useUpdateFeaturedVideo();
  const deleteVideo = useDeleteFeaturedVideo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<FeaturedVideo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FeaturedVideo | null>(null);

  const videoList = Array.isArray(videos) ? videos : videos ? [videos] : [];
  const hasVideo = videoList.length > 0;

  const handleAdd = () => {
    if (hasVideo) {
      toast({
        title: 'Limite atingido',
        description: 'Apenas um vídeo institucional é permitido. Edite ou exclua ou Edite o vídeo existente.',
        variant: 'destructive',
      });
      return;
    }
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (video: FeaturedVideo) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleSave = async (data: Omit<FeaturedVideo, 'id' | 'created_at' | 'updated_at'>) => {
    // Prevent creating a new video if one already exists
    if (!editingVideo && hasVideo) {
      toast({
        title: 'Limite atingido',
        description: 'Apenas um vídeo institucional é permitido. Edite ou exclua ou Edite o vídeo existente.',
        variant: 'destructive',
      });
      return;
    }

    // Always set active to true since there's only one video
    await saveVideo({ ...data, active: true });
  };

  const saveVideo = async (data: Omit<FeaturedVideo, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingVideo) {
      await updateVideo.mutateAsync({
        id: editingVideo.id,
        ...data,
      });
      toast({ title: 'Vídeo atualizado com sucesso' });
    } else {
      await createVideo.mutateAsync(data);
      toast({ title: 'Vídeo adicionado com sucesso' });
    }
    handleCloseModal();
  };

  const handleToggleActive = async (video: FeaturedVideo) => {
    // Since there's only one video, it should always be active
    if (!video.active) {
      await updateVideo.mutateAsync({
        id: video.id,
        active: true,
      });
      toast({
        title: 'Vídeo ativado',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    await deleteVideo.mutateAsync(deleteConfirm.id);
    toast({ title: 'Vídeo excluído com sucesso' });
    setDeleteConfirm(null);
  };

  const isSubmitting = createVideo.isPending || updateVideo.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vídeo em Destaque</h1>
          <p className="text-muted-foreground">
            Gerencie o vídeo institucional exibido na página inicial
          </p>
        </div>
        {!hasVideo && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-[300px] w-full max-w-3xl rounded-lg" />
        </div>
      ) : !hasVideo ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <VideoOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            Nenhum vídeo em destaque
          </h3>
          <p className="text-muted-foreground mb-6">
            Adicione um vídeo institucional para exibir na página inicial
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {videoList.map((video) => (
            <FeaturedVideoCard
              key={video.id}
              video={video}
              onEdit={() => handleEdit(video)}
              onDelete={() => setDeleteConfirm(video)}
              onToggleActive={() => handleToggleActive(video)}
            />
          ))}
        </div>
      )}

      {/* Info message when video exists */}
      {hasVideo && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Apenas um vídeo institucional é permitido. Para adicionar um novo vídeo,
            exclua ou edite o vídeo existente primeiro.
          </p>
        </div>
      )}

      {/* Modal */}
      <FeaturedVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        video={editingVideo}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o vídeo "{deleteConfirm?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Vídeo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default VideoDestaque;
