import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <header className="relative min-h-screen w-full bg-[#0A2540] flex flex-col pt-[120px]">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.homify.com/v1438634061/p/photo/image/792659/avare_03a.jpg" 
          className="w-full h-full object-cover opacity-50"
          alt="Fachada Casa Alto Padrão"
        />
        {/* Blue transparent overlay */}
        <div className="absolute inset-0 bg-[#0A2540]/60" />
      </div>
      
      <div className="relative z-10 w-full p-10 md:p-20 flex-grow flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="max-w-2xl">
          <h1 className="text-white text-5xl md:text-7xl font-light tracking-tight leading-tight mb-6">
            O endereço onde começa <br /><span className="font-bold text-[#C6A75E] italic">sua próxima conquista.</span>
          </h1>
          <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase border-l-2 border-[#C6A75E] pl-4">
            Residências selecionadas para quem não negocia padrão de vida.
          </p>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
