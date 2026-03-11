export type VideoType = 'youtube' | 'vimeo' | 'gdrive' | 'direct';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  order_position: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeaturedVideo {
  id: string;
  title: string;
  video_url: string;
  video_type: VideoType;
  description: string | null;
  thumbnail_url: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PopupVideo {
  id: string;
  title: string;
  video_url: string;
  video_type: VideoType;
  delay_seconds: number;
  active: boolean;
  show_once_per_session: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarouselSlideFormData {
  title: string;
  subtitle?: string;
  image: File | string;
  linkUrl?: string;
  orderPosition: number;
  active: boolean;
}

export interface FeaturedVideoFormData {
  title: string;
  videoUrl: string;
  videoType: VideoType;
  description?: string;
  thumbnailUrl?: string;
  active: boolean;
}

export interface PopupVideoFormData {
  title: string;
  videoUrl: string;
  videoType: VideoType;
  delaySeconds: number;
  showOncePerSession: boolean;
  active: boolean;
}
