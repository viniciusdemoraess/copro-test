import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import VideoUrlInput from '../shared/VideoUrlInput';
import type { FeaturedVideo, VideoType } from '@/types/media';

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface FeaturedVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video?: FeaturedVideo | null;
  onSave: (data: Omit<FeaturedVideo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isSubmitting: boolean;
}

const FeaturedVideoModal: React.FC<FeaturedVideoModalProps> = ({
  isOpen,
  onClose,
  video,
  onSave,
  isSubmitting,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!video;

  const [videoUrl, setVideoUrl] = useState(video?.video_url || '');
  const [videoType, setVideoType] = useState<VideoType | null>(
    (video?.video_type as VideoType) || null
  );
  const [urlError, setUrlError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video?.title || '',
      description: video?.description || '',
      active: video?.active ?? true,
    },
  });

  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title,
        description: video.description || '',
        active: video.active,
      });
      setVideoUrl(video.video_url);
      setVideoType(video.video_type as VideoType);
    } else {
      form.reset({
        title: '',
        description: '',
        active: true,
      });
      setVideoUrl('');
      setVideoType(null);
    }
  }, [video, form]);

  const handleVideoUrlChange = (url: string, type: VideoType | null) => {
    setVideoUrl(url);
    setVideoType(type);
    setUrlError(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!videoUrl) {
      setUrlError('URL do vídeo é obrigatória');
      return;
    }

    if (!videoType) {
      setUrlError('URL do vídeo inválida');
      return;
    }

    try {
      await onSave({
        title: data.title,
        video_url: videoUrl,
        video_type: videoType,
        description: data.description || null,
        thumbnail_url: null,
        active: data.active,
        created_by: user?.id || null,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar vídeo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Vídeo Destaque' : 'Adicionar Vídeo Destaque'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Vídeo *</Label>
            <Input
              id="title"
              placeholder="Ex: Vídeo Institucional Cooprosoja"
              {...form.register('title')}
              disabled={isSubmitting}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Video URL */}
          <VideoUrlInput
            value={videoUrl}
            onChange={handleVideoUrlChange}
            error={urlError || undefined}
            disabled={isSubmitting}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do vídeo (opcional)"
              rows={4}
              {...form.register('description')}
              disabled={isSubmitting}
            />
            <div className="flex justify-between">
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {form.watch('description')?.length || 0}/500
              </span>
            </div>
          </div>

          {/* Active Toggle - Only show when editing, since new videos are always active */}
          {isEditing && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {form.watch('active') ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <Switch
                id="active"
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedVideoModal;
