import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  /** Extra classes applied to each <img> */
  imgClassName?: string;
}

const NewsImageCarousel: React.FC<NewsImageCarouselProps> = ({
  images,
  alt,
  className,
  imgClassName,
}) => {
  // loop: false so canScrollPrev/Next reflect real boundaries;
  // wrapping would be confusing in a card context.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
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

  if (images.length === 0) return null;

  // Single image — no carousel overhead, visually identical to before
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={cn('w-full h-full object-cover', imgClassName)}
      />
    );
  }

  return (
    <div className={cn('relative w-full h-full group', className)}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
              <img
                src={src}
                alt={`${alt} — imagem ${i + 1} de ${images.length}`}
                className={cn('w-full h-full object-cover', imgClassName)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev button — só aparece quando há slide anterior */}
      {canScrollPrev && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollPrev(); }}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'bg-black/50 hover:bg-black/70 text-white rounded-full p-1',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          )}
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Next button — só aparece quando há próximo slide */}
      {canScrollNext && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollNext(); }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10',
            'bg-black/50 hover:bg-black/70 text-white rounded-full p-1',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          )}
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollTo(i); }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              i === selectedIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/80',
            )}
            aria-label={`Ir para imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsImageCarousel;
