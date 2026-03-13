import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { usePopupVideo } from '@/hooks/usePopupVideo';
import { getVideoEmbedUrl } from '@/lib/video-utils';
import type { PopupVideo, VideoType } from '@/types/media';

const VideoPopup: React.FC = () => {
  const { data } = usePopupVideo(true);
  const popup = data as PopupVideo | null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getVideoEmbedUrlForPopup = useCallback(() => {
    if (!popup) return '';
    return getVideoEmbedUrl(popup.video_url, popup.video_type as VideoType);
  }, [popup]);

  useEffect(() => {
    // Only show if we have a popup from CMS and it's active
    if (!popup || !popup.active) return;

    const delayMs = popup.delay_seconds * 1000;
    const showOncePerSession = popup.show_once_per_session;

    // Check if already shown in this session
    if (showOncePerSession) {
      const hasSeenPopup = sessionStorage.getItem('cooprosoja_video_popup_seen');
      if (hasSeenPopup) return;
    }

    // Show popup after configured delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      if (showOncePerSession) {
        sessionStorage.setItem('cooprosoja_video_popup_seen', 'true');
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [popup]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render if no popup from CMS or popup is not open
  if (!popup || !isOpen) return null;

  const videoType = popup.video_type as VideoType;
  const embedUrl = getVideoEmbedUrlForPopup();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in"
    >
      {/* Overlay - clicável para fechar */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Wrapper relativo para posicionar o botão fora do overflow-hidden */}
      <div className="relative w-full max-w-4xl">
        {/* Close button - fora do overflow-hidden, visível em mobile */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 z-10 p-2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Fechar vídeo"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden animate-scale-in">

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Video player */}
        {videoType === 'direct' ? (
          <video
            src={popup.video_url}
            controls
            autoPlay
            className="w-full h-full"
            onLoadedData={() => setIsLoading(false)}
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            title={popup.title}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default VideoPopup;