export interface Podcast {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string;
  duration: string | null;
  published_at: string | null;
  view_count: number | null;
  order_position: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PodcastForm {
  youtubeUrl: string;
  title: string;
  description?: string;
  orderPosition: number;
  active: boolean;
}

export interface YouTubeVideoData {
  title: string;
  thumbnailUrl: string;
  videoId: string;
  duration?: string;
  publishedAt?: string;
  viewCount?: number;
  channelName?: string;
}

export type PodcastOrderBy = 'manual' | 'newest' | 'oldest' | 'az' | 'za';
export type PodcastStatusFilter = 'all' | 'active' | 'inactive';
