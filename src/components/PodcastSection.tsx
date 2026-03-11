import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePodcasts } from '@/hooks/usePodcasts';
import { formatDuration } from '@/lib/youtube-utils';

const PodcastSection: React.FC = () => {
  const { data: podcasts, isLoading } = usePodcasts();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePlayClick = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-transparent">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  return (
    <section id="podcast" className="py-16 sm:py-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Podcast em Destaque
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Acompanhe nossos episódios com entrevistas, análises de mercado e novidades do agronegócio.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg rounded-full h-10 w-10 sm:h-12 sm:w-12"
            aria-label="Podcast anterior"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg rounded-full h-10 w-10 sm:h-12 sm:w-12"
            aria-label="Próximo podcast"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Carousel Container */}
          <div className="overflow-hidden mx-6 sm:mx-8" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                >
                  <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
                    {/* Thumbnail / Video */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {playingVideo === podcast.youtube_video_id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${podcast.youtube_video_id}?autoplay=1`}
                          title={podcast.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <img
                            src={podcast.thumbnail_url}
                            alt={podcast.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {/* Duration badge */}
                          {podcast.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(podcast.duration)}
                            </span>
                          )}
                          {/* Play Overlay */}
                          <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            onClick={() => handlePlayClick(podcast.youtube_video_id)}
                          >
                            <div className="bg-primary rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="h-8 w-8 text-primary-foreground fill-current" />
                            </div>
                          </div>
                          {/* Play Button Always Visible */}
                          <button
                            onClick={() => handlePlayClick(podcast.youtube_video_id)}
                            className="absolute inset-0 flex items-center justify-center"
                            aria-label={`Reproduzir ${podcast.title}`}
                          >
                            <div className="bg-primary/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-primary-foreground fill-current" />
                            </div>
                          </button>
                        </>
                      )}
                    </div>

                    <CardContent className="p-4 sm:p-5">
                      {/* Date */}
                      {podcast.published_at && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(podcast.published_at)}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-semibold text-foreground text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {podcast.title}
                      </h3>

                      {/* Description */}
                      {podcast.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {podcast.description}
                        </p>
                      )}

                      {/* YouTube Link */}
                      <a
                        href={podcast.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Assistir no YouTube
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="https://www.youtube.com/@cooprosoja"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver todos os episódios
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
