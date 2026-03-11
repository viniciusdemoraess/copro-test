import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import aboutImage from "@/assets/about-cooprosoja.png";
import { useAboutContent } from "@/hooks/useAboutContent";
import { Skeleton } from "@/components/ui/skeleton";

const About: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: whyWeExist, isLoading: loadingWhy } = useAboutContent('why_we_exist');
  const { data: informations, isLoading: loadingInfo } = useAboutContent('informations');

  const renderHTML = (html: string) => {
    return { __html: html };
  };

  const splitContent = (content: string) => {
    const paragraphs = content.match(/<p>.*?<\/p>/gs) || [];
    const firstParagraph = paragraphs[0] || '';
    const remainingParagraphs = paragraphs.slice(1).join('');
    return { firstParagraph, remainingParagraphs };
  };

  const whyWeExistData = whyWeExist as any;
  const informationsData = informations as any;

  const infoContent = informationsData?.content || '';
  const { firstParagraph, remainingParagraphs } = splitContent(infoContent);

  const displayImage = whyWeExistData?.image_url || aboutImage;

  return (
    <section id="quem-somos" className="w-full py-12 md:py-16 lg:py-20 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="w-full">
            <div className="flex flex-col relative aspect-[4/5] sm:aspect-[592/610] min-h-[350px] sm:min-h-[400px] md:min-h-[500px] lg:h-[610px] text-primary-foreground rounded-3xl overflow-hidden">
              <img
                src={displayImage}
                className="absolute h-full w-full object-cover inset-0"
                alt="Nós nivelamos o jogo para você"
                width={592}
                height={610}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-8">
                <div className="bg-accent z-10 flex w-full max-w-md flex-col items-stretch px-4 sm:px-5 py-5 sm:py-6 rounded-2xl transition-all duration-300">
                  {loadingInfo ? (
                    <>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg sm:text-xl font-extrabold uppercase">
                        {informationsData?.title || 'Informações Cooprosoja'}
                      </h3>
                      <div
                        className="text-sm sm:text-base font-normal mt-2 text-justify prose prose-sm max-w-none prose-p:my-0"
                        dangerouslySetInnerHTML={renderHTML(firstParagraph)}
                      />
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                      >
                        <div
                          className="text-sm sm:text-base font-normal text-justify prose prose-sm max-w-none prose-p:mt-2"
                          dangerouslySetInnerHTML={renderHTML(remainingParagraphs)}
                        />
                      </div>
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-sm text-accent-foreground/80 mt-3 hover:text-accent-foreground transition-colors font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <span>Ver menos</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Ver mais</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <article className="flex flex-col items-stretch">
              {loadingWhy ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-32 w-full" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl lg:text-[28px] text-secondary font-bold">
                    {whyWeExistData?.title || 'Por Que Existimos'}
                  </h2>
                  <div
                    className="text-foreground text-base sm:text-lg font-normal mt-4 leading-relaxed text-justify prose prose-lg max-w-none prose-p:mt-4 prose-em:font-medium"
                    dangerouslySetInnerHTML={renderHTML(whyWeExistData?.content || '')}
                  />
                </>
              )}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
