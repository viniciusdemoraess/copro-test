import React from "react";
import producerBackground from "@/assets/producer-background.png";
import SimplifiedAssociationForm from "@/components/SimplifiedAssociationForm";

const AssociationNew = () => {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${producerBackground})` }}
    >
      <div className="absolute inset-0 bg-primary/85" />

      <div className="relative container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="max-w-2xl w-full">
          <div className="text-white text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">Quero ser Cooperado</h1>
            <p className="text-xl text-white/90">
              Preencha o formulário abaixo e nossa equipe entrará em contato para dar continuidade ao processo.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <SimplifiedAssociationForm />
          </div>

          <p className="text-sm text-white/80 italic text-center mt-6">
            * O pré-requisito para ser um cooperado é ser um associado da Aprosoja-MT.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AssociationNew;
