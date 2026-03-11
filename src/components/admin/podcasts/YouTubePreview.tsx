import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YouTubeVideoData } from '@/types/podcast';
import { getYouTubeEmbedUrl, formatDuration } from '@/lib/youtube-utils';

interface YouTubePreviewProps {
  data: YouTubeVideoData;
  onReload: () => void;
}

const YouTubePreview: React.FC<YouTubePreviewProps> = ({ data, onReload }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Preview do Vídeo</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReload}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Carregar outro
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border bg-muted">
        <div className="aspect-video">
          <iframe
            src={getYouTubeEmbedUrl(data.videoId)}
            title={data.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm line-clamp-2">{data.title}</p>
        {data.channelName && (
          <p className="text-sm text-muted-foreground">
            Canal: {data.channelName}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {data.duration && (
            <span>Duração: {formatDuration(data.duration)}</span>
          )}
          {data.viewCount && (
            <span>{data.viewCount.toLocaleString()} visualizações</span>
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${data.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Abrir no YouTube
        </a>
      </div>
    </div>
  );
};

export default YouTubePreview;
