import type { VideoType } from '@/types/media';

export function detectVideoType(url: string): VideoType | null {
  if (!url) return null;
  
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  // Vimeo
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Google Drive
  if (url.includes('drive.google.com')) {
    return 'gdrive';
  }
  
  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return 'direct';
  }
  
  return null;
}

export function extractVideoId(url: string, type: VideoType): string {
  switch (type) {
    case 'youtube': {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      return match ? match[1] : '';
    }
    
    case 'vimeo': {
      const vimeoRegex = /vimeo\.com\/(\d+)/;
      const match = url.match(vimeoRegex);
      return match ? match[1] : '';
    }
    
    case 'gdrive': {
      const driveRegex = /\/d\/([a-zA-Z0-9_-]+)/;
      const match = url.match(driveRegex);
      return match ? match[1] : '';
    }
    
    default:
      return url;
  }
}

export function getVideoEmbedUrl(url: string, type: VideoType): string {
  const videoId = extractVideoId(url, type);
  
  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    case 'gdrive':
      return `https://drive.google.com/file/d/${videoId}/preview`;
    default:
      return url;
  }
}

export function getVideoTypeBadge(type: VideoType): { label: string; color: string } {
  switch (type) {
    case 'youtube':
      return { label: 'YouTube', color: 'bg-red-100 text-red-700' };
    case 'vimeo':
      return { label: 'Vimeo', color: 'bg-blue-100 text-blue-700' };
    case 'gdrive':
      return { label: 'Google Drive', color: 'bg-yellow-100 text-yellow-700' };
    case 'direct':
      return { label: 'Vídeo Direto', color: 'bg-gray-100 text-gray-700' };
  }
}
