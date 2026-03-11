import React from 'react';
import { useNews } from '@/hooks/useNews';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const NewsSection: React.FC = () => {
  const { data: news, isLoading } = useNews(3);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
            Notícias
          </h2>
          <p className="text-muted-foreground text-lg">
            Fique por dentro das últimas novidades da Cooprosoja
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={item.created_at || ''}>
                        {formatDate(item.created_at || '')}
                      </time>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                      {item.summary}
                    </p>
                    <Button
                      onClick={() => navigate(`/noticias/${item.slug}`)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Ler mais
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/noticias')}
                size="lg"
                className="px-8"
              >
                Ver mais notícias
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma notícia disponível no momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
