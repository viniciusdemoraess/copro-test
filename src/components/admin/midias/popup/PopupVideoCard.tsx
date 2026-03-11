import React from 'react';
import { Edit, Trash2, Power, PowerOff, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from '../shared/VideoPlayer';
import { getVideoTypeBadge } from '@/lib/video-utils';
import type { PopupVideo, VideoType } from '@/types/media';

interface PopupVideoCardProps {
  video: PopupVideo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onTest: () => void;
}

const PopupVideoCard: React.FC<PopupVideoCardProps> = ({
  video,
  onEdit,
  onDelete,
  onToggleActive,
  onTest,
}) => {
  const typeBadge = getVideoTypeBadge(video.video_type as VideoType);

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{video.title}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={typeBadge.color}>{typeBadge.label}</Badge>
            <Badge variant={video.active ? 'default' : 'secondary'}>
              {video.active ? '● Ativo' : '○ Inativo'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="rounded-lg overflow-hidden border border-border">
          <VideoPlayer url={video.video_url} type={video.video_type as VideoType} />
        </div>

        {/* Settings */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Delay: {video.delay_seconds} segundos</span>
          </div>
          <div className="text-muted-foreground">
            {video.show_once_per_session
              ? 'Exibir apenas uma vez por sessão'
              : 'Exibir sempre'}
          </div>
        </div>

        {/* URL */}
        <p className="text-sm text-muted-foreground font-mono truncate">
          {video.video_url}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
          <Button onClick={onTest} variant="secondary">
            <Play className="h-4 w-4 mr-2" />
            Testar PopUp
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={onToggleActive}>
            {video.active ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Desativar
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Ativar
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PopupVideoCard;
