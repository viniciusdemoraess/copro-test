import React from 'react';
import type { VideoType } from '@/types/media';
import { getVideoEmbedUrl } from '@/lib/video-utils';

interface VideoPlayerProps {
  url: string;
  type: VideoType;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, type, className = '' }) => {
  const embedUrl = getVideoEmbedUrl(url, type);

  if (type === 'direct') {
    return (
      <video
        src={url}
        controls
        className={`w-full aspect-video rounded-lg ${className}`}
      />
    );
  }

  return (
    <iframe
      src={embedUrl}
      className={`w-full aspect-video rounded-lg ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
};

export default VideoPlayer;
