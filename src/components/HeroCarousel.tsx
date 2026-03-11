import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarouselSlides } from "@/hooks/useCarouselSlides";

const HeroCarousel: React.FC = () => {
  const { data: slides, isLoading } = useCarouselSlides(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
    },
    [autoplayPlugin.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    autoplayPlugin.current.stop();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    autoplayPlugin.current.play();
  };

  const handleSlideClick = (link?: string | null) => {
    if (link) {
      if (link.startsWith("#")) {
        const element = document.querySelector(link);
        element?.scrollIntoView({
          behavior: "smooth",
        });
      } else if (link.startsWith("/")) {
        window.location.href = link;
      } else {
        window.open(link, "_blank");
      }
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden pb-8 sm:pb-16 md:pb-20">
        <Skeleton className="h-[280px] sm:h-[400px] md:h-[350px] lg:h-[650px] w-full" />
      </section>
    );
  }

  // Don't render if no slides from CMS
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative w-full overflow-hidden pb-8 sm:pb-16 md:pb-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 cursor-pointer"
              onClick={() => handleSlideClick(slide.link_url)}
            >
              <div className="relative h-[280px] sm:h-[400px] md:h-[350px] lg:h-[650px] w-full">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full md:object-contain lg:object-contain sm:object-contain xs:object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          scrollPrev();
        }}
        className="absolute left-2 sm:left-4 lg:left-8 top-[40%] -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-primary p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          scrollNext();
        }}
        className="absolute right-2 sm:right-4 lg:right-8 top-[40%] -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-primary p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-2 sm:bottom-16 md:bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              scrollTo(index);
            }}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-brand-yellow scale-125"
                : "bg-background/60 hover:bg-background/80"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;