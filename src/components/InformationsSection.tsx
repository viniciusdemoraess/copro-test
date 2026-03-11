import React from "react";
import { Loader2 } from "lucide-react";
import { useInfoCards } from "@/hooks/useInfoCards";

const InformationsSection: React.FC = () => {
  const { cards, isLoading } = useInfoCards('entrega');

  if (isLoading) {
    return (
      <section className="bg-primary py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </section>
    );
  }

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section className="">
      {/* Why Choose Cooprosoja Section */}
      <div className="relative bg-primary">

        {/* Dark Green Background Section */}
        <div className="relative bg-primary py-12">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <h3 className="text-primary-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-justify">
              Na Cooprosoja, acreditamos que a força está na união.
            </h3>
            <p className="text-primary-foreground/90 text-base sm:text-lg md:text-xl font-medium mb-4 leading-relaxed max-w-4xl text-justify">
              Nosso compromisso é fazer com que cada produtor tenha as mesmas oportunidades, criando um mercado mais
              justo e acessível para todos.
            </p>
            <p className="text-primary-foreground/90 text-base sm:text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-4xl text-justify">
              Com a Cooprosoja ao seu lado, você tem o poder de competir de igual para igual com os maiores players do
              setor.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {cards.map((card) => (
                <article
                  key={card.id}
                  className="flex flex-col items-stretch pt-6 md:pt-8 pb-8 md:pb-12 px-6 md:px-8 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] hover:border-white/30 hover:scale-105 hover:brightness-110 transition-all duration-300 bg-primary-foreground"
                >
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      className="aspect-[1.61] object-contain w-full"
                      alt={card.title}
                      loading="lazy"
                    />
                  )}
                  <h4 className="text-primary text-xl sm:text-2xl font-bold text-center mt-6">{card.title}</h4>
                  <p className="text-muted-foreground text-base sm:text-lg font-normal mt-4 leading-relaxed text-justify bg-secondary-foreground">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformationsSection;
