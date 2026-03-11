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
  usePopupVideo,
  useCreatePopupVideo,
  useUpdatePopupVideo,
  useDeletePopupVideo,
} from '@/hooks/usePopupVideo';
import PopupVideoCard from '@/components/admin/midias/popup/PopupVideoCard';
import PopupVideoModal from '@/components/admin/midias/popup/PopupVideoModal';
import PopupPreview from '@/components/admin/midias/popup/PopupPreview';
import type { PopupVideo } from '@/types/media';

const Popup: React.FC = () => {
  const { toast } = useToast();
  const { data: videos, isLoading } = usePopupVideo(false);
  const createVideo = useCreatePopupVideo();
  const updateVideo = useUpdatePopupVideo();
  const deleteVideo = useDeletePopupVideo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PopupVideo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PopupVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<PopupVideo | null>(null);

  const videoList = Array.isArray(videos) ? videos : videos ? [videos] : [];
  const hasVideo = videoList.length > 0;

  const handleAdd = () => {
    if (hasVideo) {
      toast({
        title: 'Limite atingido',
        description: 'Apenas um popup de vídeo é permitido. Edite ou exclua o popup existente.',
        variant: 'destructive',
      });
      return;
    }
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (video: PopupVideo) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleSave = async (data: Omit<PopupVideo, 'id' | 'created_at' | 'updated_at'>) => {
    // Prevent creating a new popup if one already exists
    if (!editingVideo && hasVideo) {
      toast({
        title: 'Limite atingido',
        description: 'Apenas um popup de vídeo é permitido. Edite ou exclua o popup existente.',
        variant: 'destructive',
      });
      return;
    }

    // Always set active to true since there's only one popup
    await saveVideo({ ...data, active: true });
  };

  const saveVideo = async (data: Omit<PopupVideo, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingVideo) {
      await updateVideo.mutateAsync({
        id: editingVideo.id,
        ...data,
      });
      toast({ title: 'PopUp atualizado com sucesso' });
    } else {
      await createVideo.mutateAsync(data);
      toast({ title: 'PopUp adicionado com sucesso' });
    }
    handleCloseModal();
  };

  const handleToggleActive = async (video: PopupVideo) => {
    // Since there's only one popup, it should always be active
    if (!video.active) {
      await updateVideo.mutateAsync({
        id: video.id,
        active: true,
      });
      toast({
        title: 'PopUp ativado',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    await deleteVideo.mutateAsync(deleteConfirm.id);
    toast({ title: 'PopUp excluído com sucesso' });
    setDeleteConfirm(null);
  };

  const isSubmitting = createVideo.isPending || updateVideo.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PopUp de Vídeo</h1>
          <p className="text-muted-foreground">
            Gerencie o vídeo popup exibido ao carregar a página inicial
          </p>
        </div>
        {!hasVideo && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar PopUp
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
            Nenhum popup configurado
          </h3>
          <p className="text-muted-foreground mb-6">
            Configure um vídeo popup para exibir ao carregar a página inicial
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar PopUp
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {videoList.map((video) => (
            <PopupVideoCard
              key={video.id}
              video={video}
              onEdit={() => handleEdit(video)}
              onDelete={() => setDeleteConfirm(video)}
              onToggleActive={() => handleToggleActive(video)}
              onTest={() => setPreviewVideo(video)}
            />
          ))}
        </div>
      )}

      {/* Info message when popup exists */}
      {hasVideo && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Apenas um popup de vídeo é permitido. Para adicionar um novo popup,
            exclua ou Edite o popup existente primeiro.
          </p>
        </div>
      )}

      {/* Modal */}
      <PopupVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        video={editingVideo}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Preview */}
      {previewVideo && (
        <PopupPreview
          video={previewVideo}
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o popup "{deleteConfirm?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir PopUp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Popup;
