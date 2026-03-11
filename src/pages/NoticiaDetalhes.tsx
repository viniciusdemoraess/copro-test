import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useNewsBySlug } from '@/hooks/useNews';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';

const NoticiaDetalhes: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: news, isLoading } = useNewsBySlug(slug || '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderHTML = (html: string) => {
    return { __html: html };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {isLoading ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-48 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : news ? (
          <>
            <div className="bg-primary py-8 md:py-12">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/noticias')}
                  className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para notícias
                </Button>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                  {news.title}
                </h1>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Calendar className="w-5 h-5" />
                  <time dateTime={news.created_at || ''} className="text-lg">
                    {formatDate(news.created_at || '')}
                  </time>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mb-8">
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>

              <article
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-a:text-primary prose-img:rounded-lg"
                dangerouslySetInnerHTML={renderHTML(news.content)}
              />

              <div className="mt-12 pt-8 border-t">
                <Button
                  onClick={() => navigate('/noticias')}
                  variant="outline"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ver todas as notícias
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Notícia não encontrada
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                A notícia que você está procurando não existe ou foi removida.
              </p>
              <Button onClick={() => navigate('/noticias')} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver todas as notícias
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default NoticiaDetalhes;
