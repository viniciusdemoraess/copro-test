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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import VideoUrlInput from '../shared/VideoUrlInput';
import type { PopupVideo, VideoType } from '@/types/media';

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  delaySeconds: z.number().min(0).max(30),
  showOncePerSession: z.boolean(),
  active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface PopupVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video?: PopupVideo | null;
  onSave: (data: Omit<PopupVideo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isSubmitting: boolean;
}

const PopupVideoModal: React.FC<PopupVideoModalProps> = ({
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
      delaySeconds: video?.delay_seconds ?? 2,
      showOncePerSession: video?.show_once_per_session ?? true,
      active: video?.active ?? true,
    },
  });

  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title,
        delaySeconds: video.delay_seconds,
        showOncePerSession: video.show_once_per_session,
        active: video.active,
      });
      setVideoUrl(video.video_url);
      setVideoType(video.video_type as VideoType);
    } else {
      form.reset({
        title: '',
        delaySeconds: 2,
        showOncePerSession: true,
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
        delay_seconds: data.delaySeconds,
        show_once_per_session: data.showOncePerSession,
        active: data.active,
        created_by: user?.id || null,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar popup',
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
            {isEditing ? 'Editar PopUp de Vídeo' : 'Adicionar PopUp de Vídeo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Vídeo *</Label>
            <Input
              id="title"
              placeholder="Ex: Boas-vindas Cooprosoja"
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

          {/* Delay */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Delay de Exibição</Label>
              <span className="text-sm font-medium">
                {form.watch('delaySeconds')} segundos
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[form.watch('delaySeconds')]}
                onValueChange={([value]) => form.setValue('delaySeconds', value)}
                max={30}
                min={0}
                step={1}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Input
                type="number"
                value={form.watch('delaySeconds')}
                onChange={(e) => form.setValue('delaySeconds', parseInt(e.target.value) || 0)}
                min={0}
                max={30}
                disabled={isSubmitting}
                className="w-20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo após carregamento da página
            </p>
          </div>

          {/* Show Once */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="showOnce"
              checked={form.watch('showOncePerSession')}
              onCheckedChange={(checked) => form.setValue('showOncePerSession', !!checked)}
              disabled={isSubmitting}
            />
            <div>
              <Label htmlFor="showOnce" className="cursor-pointer">
                Exibir apenas uma vez por sessão
              </Label>
              <p className="text-xs text-muted-foreground">
                Se marcado, o popup não aparecerá novamente após ser fechado
              </p>
            </div>
          </div>

          {/* Active Toggle - Only show when editing, since new popups are always active */}
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

export default PopupVideoModal;
