import React from 'react';
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from '../shared/VideoPlayer';
import { getVideoTypeBadge } from '@/lib/video-utils';
import type { FeaturedVideo, VideoType } from '@/types/media';

interface FeaturedVideoCardProps {
  video: FeaturedVideo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

const FeaturedVideoCard: React.FC<FeaturedVideoCardProps> = ({
  video,
  onEdit,
  onDelete,
  onToggleActive,
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

        {/* Description */}
        {video.description && (
          <p className="text-muted-foreground">{video.description}</p>
        )}

        {/* URL */}
        <p className="text-sm text-muted-foreground font-mono truncate">
          {video.video_url}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Vídeo
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

export default FeaturedVideoCard;
