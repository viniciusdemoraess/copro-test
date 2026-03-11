import React from 'react';
import * as Icons from 'lucide-react';
import { useInfoCards } from '@/hooks/useInfoCards';
import { Skeleton } from '@/components/ui/skeleton';

const Servicos: React.FC = () => {
  const { cards, isLoading } = useInfoCards('servico');
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-[80px] px-4">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nossos Serviços
          </h1>
          <p className="text-base md:text-xl max-w-[800px] mx-auto leading-relaxed">
            A Cooprosoja oferece suporte completo para pequenos e médios produtores que desejam adquirir maquinário agrícola de forma segura, econômica e eficiente.
          </p>
        </div>
      </section>

      {/* Grid de Serviços */}
      <section className="bg-background py-16 md:py-20 px-4 flex-1">
        <div className="container mx-auto max-w-[1200px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[250px] rounded-2xl" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum serviço cadastrado no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {cards.map((card) => {
                const Icon = card.icon_name 
                  ? (Icons[card.icon_name as keyof typeof Icons] as React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>)
                  : null;
                return (
                  <article
                    key={card.id}
                    className="bg-card rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 md:p-10 group"
                    style={{ backgroundColor: card.background_color !== '#ffffff' ? card.background_color : undefined }}
                  >
                    {/* Ícone ou Imagem */}
                    <div className="mb-6 inline-flex items-center justify-center">
                      {card.image_url ? (
                        <img 
                          src={card.image_url} 
                          alt={card.title}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : Icon ? (
                        <div 
                          className="p-4 rounded-full group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundColor: `${card.icon_color}20` }}
                        >
                          <Icon 
                            className="w-12 h-12 md:w-16 md:h-16" 
                            strokeWidth={1.5}
                            style={{ color: card.icon_color }}
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      {card.title}
                    </h2>

                    {/* Descrição */}
                    <div 
                      className="text-base text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                    
                    {/* Link */}
                    {card.link_url && (
                      <a 
                        href={card.link_url}
                        className="inline-flex items-center mt-4 text-sm font-medium hover:underline"
                        style={{ color: card.icon_color }}
                      >
                        {card.link_text}
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Servicos;