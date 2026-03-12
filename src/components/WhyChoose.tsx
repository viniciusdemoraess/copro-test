import React, { useEffect, useRef, useState } from "react";
import timelinePart1 from "@/assets/timeline-part1.png";
import timelinePart2 from "@/assets/timeline-part2.png";

const WhyChoose: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      image:
        "https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/b2e50cb403d5de0a8a1043129ffa4b2d7411d9f5?placeholderIfAbsent=true",
      title: "Poder de Barganha",
      description:
        "Ao unir a demanda de vários produtores, a Cooprosoja garante negociações mais favoráveis, resultando em preços significativamente menores.",
    },
    {
      image:
        "https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/4011d246f1dfdb1cd1d80544a48fae7d949a1a53?placeholderIfAbsent=true",
      title: "Descontos Competitivos",
      description:
        "Pequenos e médios produtores ganham o mesmo poder de compra dos grandes produtores, sem precisar comprometer a qualidade dos equipamentos.",
    },
    {
      image:
        "https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/4011d246f1dfdb1cd1d80544a48fae7d949a1a53?placeholderIfAbsent=true",
      title: "Transparência e Confiança",
      description:
        "Como cooperativa, todos os membros têm voz ativa e participam das decisões, garantindo que os benefícios sejam distribuídos de forma justa e equitativa.",
    },
  ];

  const arrows = [
    "https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/fce380bb3619b4916c5713e21cc8abe5abe4430b?placeholderIfAbsent=true",
    "https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/0a277bd5ce018a5b67523f38c634901a3735f6f4?placeholderIfAbsent=true",
  ];

  return (
    <>
      {/* Seção Linha Temporal */}
      {/* <section className="bg-background py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
            Linha Temporal
          </h2>
          <p className="text-muted-foreground text-center text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-3xl mx-auto">
            Cooperativa dos Produtores de Soja e Milho do Estado do Mato Grosso
          </p>
          <div className="flex flex-col gap-6 md:gap-8">
            <img
              src={timelinePart1}
              alt="Linha Temporal - Parte 1: Maio 2023 a Novembro 2024"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <img
              src={timelinePart2}
              alt="Linha Temporal - Parte 2: Dezembro 2024 a Junho 2025"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section> */}

      <div className="bg-accent self-center z-10 flex w-full max-w-4xl mx-auto flex-col items-stretch text-3xl sm:text-4xl md:text-5xl text-accent-foreground font-bold justify-center mt-16 md:mt-24 lg:mt-32 xl:mt-[198px] px-6 sm:px-10 md:px-12 lg:px-[59px] py-6 md:py-8 lg:py-[34px]">
        <h2 className="text-center">Nossas Entregas</h2>
      </div>

      <section className="bg-primary flex flex-col items-stretch justify-center py-px w-full">
        <div className="flex flex-col relative min-h-[600px] md:min-h-[800px] lg:min-h-[1089px] w-full pt-16 md:pt-24 lg:pt-[133px] pb-12 md:pb-16 lg:pb-[66px] px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
          <img
            src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/05ece31fc6390796eef084a35af9760352a7a6e6?placeholderIfAbsent=true"
            className="absolute h-full w-full object-cover inset-0"
            alt="Agricultural background"
          />
          <div ref={sectionRef} className="relative flex w-full max-w-7xl mx-auto flex-col items-stretch">
            <div
              className={`flex w-full flex-col items-stretch transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-primary-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold leading-tight">
                Na Cooprosoja, acreditamos que a força está na união.
              </h2>
              <p className="text-primary-foreground/90 text-base sm:text-lg md:text-xl lg:text-[22px] font-medium mt-8 md:mt-12 lg:mt-[55px] leading-relaxed">
                Nosso compromisso é fazer com que cada produtor tenha as mesmas oportunidades, criando um mercado mais
                justo e acessível para todos. <br />
                <br />
                Com a Cooprosoja ao seu lado, você tem o poder de competir de igual para igual com os maiores players do
                setor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 md:mt-12 lg:mt-[35px]">
              {features.map((feature, index) => (
                <article
                  key={index}
                  className={`flex flex-col items-stretch pt-6 md:pt-8 lg:pt-[34px] pb-12 md:pb-16 lg:pb-[75px] px-6 md:px-8 rounded-2xl bg-background/95 shadow-lg hover:shadow-xl transition-all duration-700 ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                >
                  <img src={feature.image} className="aspect-[1.61] object-contain w-full" alt={feature.title} />
                  <h3 className="text-primary text-xl sm:text-2xl lg:text-[28px] font-bold text-center mt-6 md:mt-8 lg:mt-[34px]">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base sm:text-lg md:text-xl lg:text-2xl font-normal mt-6 md:mt-8 lg:mt-[39px] leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChoose;
