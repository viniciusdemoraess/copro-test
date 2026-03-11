import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import YouTubeUrlInput from './YouTubeUrlInput';
import YouTubePreview from './YouTubePreview';
import { useCreatePodcast, useUpdatePodcast, useCheckDuplicateUrl, useNextOrderPosition } from '@/hooks/usePodcasts';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/youtube-utils';
import { Podcast, YouTubeVideoData } from '@/types/podcast';
import { useAuth } from '@/contexts/AuthContext';

interface PodcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podcast?: Podcast | null;
}

const PodcastModal: React.FC<PodcastModalProps> = ({
  open,
  onOpenChange,
  podcast,
}) => {
  const isEditing = !!podcast;
  const { user } = useAuth();
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeData, setYoutubeData] = useState<YouTubeVideoData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderPosition, setOrderPosition] = useState(1);
  const [active, setActive] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createPodcast = useCreatePodcast();
  const updatePodcast = useUpdatePodcast();
  const checkDuplicate = useCheckDuplicateUrl();
  const { data: nextOrder } = useNextOrderPosition();

  const isSubmitting = createPodcast.isPending || updatePodcast.isPending;

  useEffect(() => {
    if (open) {
      // Limpar erros ao abrir o modal
      setSubmitError(null);
      setUrlError(null);
      
      if (podcast) {
        setYoutubeUrl(podcast.youtube_url);
        setTitle(podcast.title);
        setDescription(podcast.description || '');
        setOrderPosition(podcast.order_position);
        setActive(podcast.active);
        setYoutubeData({
          title: podcast.title,
          thumbnailUrl: podcast.thumbnail_url,
          videoId: podcast.youtube_video_id,
          duration: podcast.duration || undefined,
          viewCount: podcast.view_count || undefined,
        });
      } else {
        resetForm();
        if (nextOrder) {
          setOrderPosition(nextOrder);
        }
      }
    }
  }, [open, podcast, nextOrder]);

  const resetForm = () => {
    setYoutubeUrl('');
    setYoutubeData(null);
    setTitle('');
    setDescription('');
    setOrderPosition(1);
    setActive(true);
    setUrlError(null);
    setSubmitError(null);
  };

  const handleYouTubeDataLoaded = (data: YouTubeVideoData) => {
    setYoutubeData(data);
    if (!title) {
      setTitle(data.title);
    }
  };

  const handleReloadYouTube = () => {
    setYoutubeData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setSubmitError(null);
    setUrlError(null);
    
    if (!youtubeData) {
      setUrlError('Carregue as informações do vídeo primeiro');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setUrlError('URL do YouTube inválida');
      return;
    }

    try {
      // Check for duplicate URL
      const isDuplicate = await checkDuplicate.mutateAsync({
        url: youtubeUrl,
        excludeId: podcast?.id,
      });

      if (isDuplicate) {
        setUrlError('Este vídeo já foi adicionado');
        return;
      }

      const podcastData = {
        title,
        description: description || null,
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        thumbnail_url: youtubeData.thumbnailUrl || getYouTubeThumbnailUrl(videoId),
        duration: youtubeData.duration || null,
        published_at: youtubeData.publishedAt || null,
        view_count: youtubeData.viewCount || null,
        order_position: orderPosition,
        active,
        created_by: user?.id || null,
      };

      if (isEditing) {
        await updatePodcast.mutateAsync({ id: podcast.id, ...podcastData });
      } else {
        await createPodcast.mutateAsync(podcastData);
      }

      // Só fecha o modal se não houver erro
      onOpenChange(false);
    } catch (error) {
      // Captura erros específicos e exibe mensagens claras
      let errorMessage = 'Erro ao salvar o podcast';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Mensagens mais amigáveis para erros comuns
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        errorMessage = 'Este vídeo já foi adicionado anteriormente';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorMessage = 'Você não tem permissão para realizar esta ação';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos';
      }
      
      setSubmitError(errorMessage);
    }
  };

  const isFormValid = youtubeData && title.trim().length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Podcast' : 'Adicionar Podcast'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do podcast'
              : 'Adicione um novo episódio do YouTube'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exibir erro de submit de forma destacada */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao salvar</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {!youtubeData ? (
            <YouTubeUrlInput
              value={youtubeUrl}
              onChange={(val) => {
                setYoutubeUrl(val);
                setUrlError(null);
                setSubmitError(null);
              }}
              onDataLoaded={handleYouTubeDataLoaded}
              error={urlError || undefined}
            />
          ) : (
            <YouTubePreview data={youtubeData} onReload={handleReloadYouTube} />
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título do Episódio *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSubmitError(null);
              }}
              placeholder="Ex: Como aumentar sua produtividade"
              maxLength={200}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {title.length}/200
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmitError(null);
              }}
              placeholder="Adicione uma descrição do episódio"
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {description.length}/1000
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Posição na Lista</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={orderPosition}
                onChange={(e) => {
                  setOrderPosition(parseInt(e.target.value) || 1);
                  setSubmitError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={active}
                  onCheckedChange={(checked) => {
                    setActive(checked);
                    setSubmitError(null);
                  }}
                />
                <span className="text-sm">
                  {active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Podcast'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PodcastModal;
