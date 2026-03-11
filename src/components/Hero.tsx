import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] font-bold text-right -mt-3 pt-20 md:pt-32 lg:pt-[173px] pb-32 md:pb-52 lg:pb-[330px] px-5 sm:px-8 md:px-12 lg:px-20">
      <img
        src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/21ceca197083ccbc5b86c48968f9114256dcc31a?placeholderIfAbsent=true"
        className="absolute h-full w-full object-cover inset-0"
        alt="Agricultural field background"
      />
      <div className="relative text-primary-foreground text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[92px] tracking-wide">
        Nós nivelamos
      </div>
      <div className="relative text-brand-yellow text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] tracking-wide mt-4 md:mt-5 lg:mt-[21px] ml-0 sm:ml-12 md:ml-24 lg:ml-[220px]">
        o jogo para você!
      </div>
    </section>
  );
};

export default Hero;
