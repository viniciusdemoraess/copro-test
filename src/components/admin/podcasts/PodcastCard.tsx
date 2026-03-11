import React, { useState } from 'react';
import { GripVertical, Play, Edit, Trash2, Clock, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Podcast } from '@/types/podcast';
import { formatDuration, formatViewCount, getYouTubeEmbedUrl } from '@/lib/youtube-utils';
import { useTogglePodcastStatus, useDeletePodcast } from '@/hooks/usePodcasts';
import { cn } from '@/lib/utils';

interface PodcastCardProps {
  podcast: Podcast;
  isDragEnabled: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onEdit: (podcast: Podcast) => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  isDragEnabled,
  dragHandleProps,
  onEdit,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const toggleStatus = useTogglePodcastStatus();
  const deletePodcast = useDeletePodcast();

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStatus.mutate({ id: podcast.id, active: !podcast.active });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(podcast);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deletePodcast.mutate(podcast.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        onClick={() => setShowPreview(true)}
      >
        {/* Drag Handle */}
        {isDragEnabled && (
          <div
            {...dragHandleProps}
            className="flex justify-start mb-2 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
          <img
            src={podcast.thumbnail_url}
            alt={podcast.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
          {podcast.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(podcast.duration)}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-2 mb-2">
          <Play className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <h3 className="text-sm font-semibold line-clamp-2">{podcast.title}</h3>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {podcast.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(podcast.duration)}
            </span>
          )}
          {podcast.view_count && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(podcast.view_count)}
            </span>
          )}
        </div>

        {/* Status and Order */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={podcast.active ? 'default' : 'secondary'}
            className={cn(
              'cursor-pointer text-xs',
              podcast.active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            onClick={handleStatusToggle}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full mr-1.5',
                podcast.active ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
            {podcast.active ? 'Ativo' : 'Inativo'}
          </Badge>

          {isDragEnabled && (
            <Badge variant="outline" className="text-xs">
              #{podcast.order_position}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="w-full"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="line-clamp-2">{podcast.title}</DialogTitle>
          </DialogHeader>

          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              src={getYouTubeEmbedUrl(podcast.youtube_video_id)}
              title={podcast.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {podcast.description && (
            <p className="text-sm text-muted-foreground">{podcast.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {podcast.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(podcast.duration)}
              </span>
            )}
            {podcast.view_count && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatViewCount(podcast.view_count)} visualizações
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(podcast.youtube_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no YouTube
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false);
                onEdit(podcast);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o podcast "{podcast.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Podcast
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PodcastCard;
