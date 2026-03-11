import { YouTubeVideoData } from '@/types/podcast';

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
    /(?:youtube\.com\/v\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'high' | 'max' = 'high'): string {
  const qualityMap = {
    default: 'hqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  };
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function fetchYouTubeData(videoId: string): Promise<YouTubeVideoData> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Vídeo não encontrado ou privado');
    }
    
    const data = await response.json();
    
    return {
      title: data.title,
      thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'max'),
      videoId,
      channelName: data.author_name,
    };
  } catch (error) {
    throw new Error('Não foi possível carregar informações do vídeo');
  }
}

export function formatDuration(duration: string | null): string {
  if (!duration) return '';
  
  // If already in MM:SS or HH:MM:SS format
  if (duration.includes(':')) return duration;
  
  // Parse ISO 8601 duration (PT15M30S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatViewCount(count: number | null): string {
  if (!count) return '';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
