import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import cooperadoImage from "@/assets/cooperado-farmer.png";

const BENEFICIOS = [
  "Economia na compra de insumos",
  "Poder de negociação em conjunto",
  "Acesso a novas tecnologias",
  "Assistência Técnica e Gerencial",
  "Capacitação e Treinamentos",
  "Suporte Jurídico e Operacional",
  "Sustentabilidade e inovação no campo",
];

const CooperativeBenefits = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative -mt-10 md:-mt-16">
        <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24 fill-primary" preserveAspectRatio="none">
          <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <section id="beneficios-cooperados" className="relative bg-primary overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:gap-x-4 items-center">
            {/* Left Column - Text Content */}
            <div className="text-white z-10">
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-2 mt-14">BENEFÍCIOS COOPERADOS</h2>

              <p className="text-lg md:text-xl leading-relaxed mb-8 opacity-95">
                Atuamos para apoiar o desenvolvimento econômico, social e tecnológico dos nossos cooperados.
              </p>

              <ul className="space-y-4 mb-10">
                {BENEFICIOS.map((beneficio, index) => (
                  <li key={index} className="flex items-center gap-3 text-base md:text-lg">
                    <CheckCircle className="w-6 h-6 text-[#5FD68A] flex-shrink-0" />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/associacao")}
                className="bg-[#F5A623] hover:bg-[#e09620] text-white font-bold uppercase text-sm md:text-base px-8 py-6 rounded-full shadow-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl mb-14"
              >
                QUERO SER UM COOPERADO
              </Button>
            </div>

            {/* Right Column - Image with Decorative Elements */}
            <div className="relative flex items-end justify-center lg:justify-end self-end">
              <img
                src={cooperadoImage}
                alt="Cooperado satisfeito representando os benefícios da cooperativa"
                loading="lazy"
                className="relative z-10 w-auto h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CooperativeBenefits;