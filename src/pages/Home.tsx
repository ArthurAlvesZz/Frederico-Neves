import React, { useRef } from 'react';
import HeroSection from '../sections/HeroSection';
import CredibilityBar from '../sections/CredibilityBar';
import InvestmentSection from '../sections/InvestmentSection';
import ProcessSection from '../sections/ProcessSection';
import ExclusivitySection from '../sections/ExclusivitySection';
import { useProperties } from '../hooks/useProperties';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Ruler, Diamond, ArrowRight } from 'lucide-react';
import TestimonialsSection from '../components/TestimonialsSection';
import { motion, useScroll, useTransform } from 'motion/react';

const Home = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main ref={scrollRef} className="relative bg-gray-950 text-white min-h-screen">
      <HeroSection />
      <CredibilityBar />

      <motion.section 
        className="pt-32 pb-32 relative overflow-hidden"
        style={{ scale, opacity }}
      >
        <div className="absolute inset-0 bg-[#C6A75E]/5 blur-[200px] pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
            <h2 className="text-5xl md:text-7xl font-light tracking-tight text-white">
              Imóveis <span className="font-bold text-[#C6A75E] italic">selecionados</span> para poucos
            </h2>
            <Link 
              to="/search" 
              className="flex items-center gap-2 text-[#C6A75E] text-lg font-medium hover:text-[#a88a4c] transition-colors group ml-auto flex-shrink-0"
            >
              Ver todo o portfólio 
              <span className="p-2 bg-[#C6A75E]/10 rounded-full group-hover:bg-[#C6A75E]/20 transition-colors">
                <ArrowRight size={20} />
              </span>
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x snap-mandatory">
            {properties.map(p => (
              <motion.div 
                key={p.id} 
                onClick={() => navigate(`/property/${p.id}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex-none w-[380px] h-[550px] relative rounded-3xl overflow-hidden group shadow-2xl border border-white/10 cursor-pointer"
              >
                <img 
                  src={p.image} 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={p.title} 
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                
                {/* Tag */}
                <div className="absolute top-6 left-6 z-10 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-medium uppercase tracking-wider">
                  {p.tag}
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                  <h3 className="text-white text-3xl font-light mb-2">{p.title}</h3>
                  <p className="text-gray-300 text-sm mb-6 flex items-center gap-2">
                    <span className="text-[#C6A75E] font-bold">●</span> {p.neighborhood}, {p.location}
                  </p>
                  
                  {/* Property Data */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Preço</p>
                      <p className="text-white font-medium text-lg">R$ {(p.price / 1000000).toFixed(1)} Mi</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Área</p>
                      <p className="text-white font-medium text-lg">{p.sqft} m²</p>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Bed size={16} /> <span className="font-light">{p.beds}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Ruler size={16} /> <span className="font-light">{p.baths} Banheiros</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <ProcessSection />
      <InvestmentSection />
      <ExclusivitySection />
      <TestimonialsSection />

      <section className="py-32 relative overflow-hidden text-center rounded-[3rem] mx-4 md:mx-6 mb-12 bg-[#0A2540]">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://portalmad.com.br/wp-content/uploads/2022/08/porta-de-entrada-com-vidro-lateral-portal-madeira.jpg" 
            alt="Porta de Luxo Madeira" 
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A2540]/85 backdrop-blur-[2px]" />
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C6A75E]/20 via-transparent to-transparent pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-8 text-white">
            Pronto para a sua próxima <span className="font-bold text-[#C6A75E] italic">conquista?</span>
          </h2>
          <p className="text-gray-300 mb-12 text-lg md:text-xl font-light leading-relaxed">
            Agende uma reunião sigilosa. Elevamos a busca de imóveis ao mesmo patamar de uma assessoria de patrimônio familiar.
          </p>
          <a 
            href="https://wa.me/553492515354" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#C6A75E] text-gray-950 font-bold text-lg hover:bg-[#b09350] transition-colors shadow-2xl"
          >
            Solicitar acesso às oportunidades
          </a>
        </div>
      </section>
    </main>
  );
};

export default Home;
