import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const CredibilityBar = () => {
  return (
    <section className="relative py-24 border-b border-[#C6A75E]/20 text-white overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.homify.com/v1499870024/p/photo/image/2120711/08.jpg" 
          alt="Fachada Noturna Alto Padrão" 
          className="w-full h-full object-cover"
        />
        {/* Adjusted transparent black overlay */}
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="container-custom relative z-10">
        {/* Top Section: Photo and Title */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-center mb-16">
          {/* Foto de Perfil */}
          <div className="flex-shrink-0">
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-[#C6A75E] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80" 
                alt="Frederico Neves" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <div className="flex-grow w-full text-center md:text-left">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Sua <span className="text-[#C6A75E] italic font-bold">próxima grande<br className="hidden md:block" /> conquista</span>, 
              curada com exclusividade por <br className="hidden md:block" />
              <span className="text-[#C6A75E] italic font-bold">Frederico Neves</span>.
            </h2>
          </div>
        </div>

        {/* Quadro Comparativo (Full Horizontal Width) */}
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          {/* Vantagens Frederico */}
          <div className="space-y-6 bg-[#C6A75E]/10 px-8 py-10 rounded-3xl border border-[#C6A75E]/30 w-full shadow-2xl backdrop-blur-sm">
            <h4 className="text-2xl font-bold text-[#C6A75E] mb-8 whitespace-nowrap">Por que Frederico Neves?</h4>
            {[
              'Consultoria imobiliária de alto nível',
              'Patrimônio protegido e valorizado',
              'Sigilo absoluto e discrição total',
              'Acesso a Oportunidades VIP (Off-Market)'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white">
                <Check className="text-[#C6A75E] flex-shrink-0" size={28} />
                <span className="text-lg md:text-xl font-medium leading-tight whitespace-nowrap">{item}</span>
              </div>
            ))}
          </div>

          {/* Vantagens Comuns */}
          <div className="space-y-6 bg-white/10 px-8 py-10 rounded-3xl border border-white/10 w-full shadow-2xl backdrop-blur-sm">
            <h4 className="text-2xl font-bold text-gray-200 mb-8 whitespace-nowrap">Venda Tradicional</h4>
            {[
              'Foco exclusivo na comissão (volume)',
              'Catálogo genérico e exposto',
              'Exposição do seu imóvel ao risco',
              'Processo burocrático e sem consultoria'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-gray-300">
                <X className="text-red-500 flex-shrink-0" size={28} />
                <span className="text-lg md:text-xl font-medium leading-tight whitespace-nowrap">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredibilityBar;
