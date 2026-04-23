import React from 'react';
import { motion } from 'motion/react';
import { Target, Search, Eye, ShieldCheck } from 'lucide-react';

const steps = [
  {
    title: 'Mapeamento de Perfil',
    subtitle: 'Fase 1: Entendimento',
    desc: 'Análise criteriosa e sigilosa do seu perfil.',
    icon: Target
  },
  {
    title: 'Curadoria Estrita',
    subtitle: 'Fase 2: Busca',
    desc: 'Seleção apenas de propriedades singulares.',
    icon: Search
  },
  {
    title: 'Experiência Imersiva',
    subtitle: 'Fase 3: Apresentação',
    desc: 'Visitas exclusivas a imóveis que superam suas exigências.',
    icon: Eye
  },
  {
    title: 'Fechamento Blindado',
    subtitle: 'Fase 4: Negociação',
    desc: 'Assessoria integral para firmar o negócio com segurança.',
    icon: ShieldCheck
  }
];

const ProcessSection = () => {
  return (
    <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C6A75E]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            O Método <span className="font-bold text-[#C6A75E] italic">Exclusivo</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Um processo desenhado como um mapa estratégico compacto para localizar sua próxima conquista.
          </p>
        </div>

        <div className="relative w-full">
          {/* Linha Central Horizontal do Mapa (Apenas Desktop) */}
          <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-px bg-[#C6A75E]/30 -translate-y-1/2 z-0" />

          {/* Grid Compacto 4 Colunas no Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
            {steps.map((step, index) => {
              const isTop = index % 2 === 0;
              return (
                <div key={index} className="relative flex flex-col items-center">
                   
                   {/* Layout Desktop (Alternando Cima / Baixo) */}
                   <div className="hidden lg:flex flex-col items-center w-full h-[360px]">
                      {isTop ? (
                         <>
                           <div className="flex-1 w-full flex items-end pb-6">
                             <Card step={step} index={index} />
                           </div>
                           
                           {/* Conexão */}
                           <div className="relative flex flex-col items-center justify-center -mb-[6px]">
                             <div className="w-px h-6 bg-[#C6A75E]/50 absolute bottom-full mb-1" />
                             <div className="w-3 h-3 rounded-full bg-[#C6A75E] z-20 shadow-[0_0_8px_rgba(198,167,94,1)] ring-4 ring-gray-950" />
                           </div>
                           
                           <div className="flex-1 w-full" />
                         </>
                      ) : (
                         <>
                           <div className="flex-1 w-full" />
                           
                           {/* Conexão */}
                           <div className="relative flex flex-col items-center justify-center -mt-[6px]">
                             <div className="w-3 h-3 rounded-full bg-[#C6A75E] z-20 shadow-[0_0_8px_rgba(198,167,94,1)] ring-4 ring-gray-950" />
                             <div className="w-px h-6 bg-[#C6A75E]/50 absolute top-full mt-1" />
                           </div>
                           
                           <div className="flex-1 w-full flex items-start pt-6">
                             <Card step={step} index={index} />
                           </div>
                         </>
                      )}
                   </div>

                   {/* Layout Mobile (Lista Compacta) */}
                   <div className="lg:hidden flex w-full mb-4">
                      <Card step={step} index={index} />
                   </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ step, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[1.25rem] w-full relative overflow-hidden group hover:bg-white/10 hover:border-[#C6A75E]/40 transition-all duration-300 shadow-xl"
  >
    <div className="absolute -top-3 right-3 text-6xl font-bold text-white/[0.03] tracking-tighter select-none transition-transform group-hover:scale-110">
      0{index + 1}
    </div>
    
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6A75E]/20 to-transparent border border-[#C6A75E]/20 flex items-center justify-center text-[#C6A75E] mb-4 relative z-10 transition-transform group-hover:-translate-y-1">
      <step.icon size={18} strokeWidth={2} />
    </div>
    
    <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#C6A75E] font-bold mb-1 relative z-10">
      {step.subtitle}
    </h4>
    <h3 className="text-lg font-light text-white mb-2 relative z-10 tracking-tight leading-tight">
      {step.title}
    </h3>
    <p className="text-gray-400 text-sm font-light leading-snug relative z-10">
      {step.desc}
    </p>
  </motion.div>
);

export default ProcessSection;
