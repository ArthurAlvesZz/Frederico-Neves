import React, { useRef } from 'react';
import { TESTIMONIALS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const TestimonialsSection = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -420 : 420;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
            <div className="container-custom max-w-7xl mx-auto">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between items-start mb-16 gap-6">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                        Jornadas de <span className="font-bold text-[#C6A75E] italic">Sucesso</span>
                    </h2>
                    <p className="text-gray-400 mt-4 font-light max-w-xl">
                      Histórias reais de executivos, investidores e famílias que confiaram na nossa inteligência imobiliária com sigilo absoluto.
                    </p>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex gap-4">
                      <button 
                          onClick={() => scroll('left')}
                          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#C6A75E] hover:border-[#C6A75E] hover:text-gray-950 transition-colors"
                      >
                          <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                          onClick={() => scroll('right')}
                          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#C6A75E] hover:border-[#C6A75E] hover:text-gray-950 transition-colors"
                      >
                          <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x snap-mandatory"
                >
                    {TESTIMONIALS.map((t) => (
                        <motion.div 
                          key={t.id} 
                          className="flex-none w-[360px] md:w-[420px] bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-colors snap-center flex flex-col justify-between"
                        >
                            <div>
                              <div className="flex items-center gap-2 mb-6">
                                {[...Array(t.stars)].map((_, i) => (
                                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#C6A75E" stroke="#C6A75E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                              </div>
                              <h3 className="text-white font-medium text-lg mb-3 tracking-wide">{t.caseTitle}</h3>
                              <p className="text-gray-400 leading-relaxed mb-10 font-light italic text-sm md:text-base">
                                  "{t.text}"
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-5 pt-6 border-t border-white/10">
                                {t.image ? (
                                    <img src={t.image} alt={t.nome} className="w-14 h-14 rounded-full object-cover border-2 border-[#C6A75E]/50" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-[#C6A75E]/10 text-[#C6A75E] border border-[#C6A75E]/30 flex items-center justify-center font-bold tracking-widest text-lg">
                                        {t.init}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-bold text-white text-base md:text-lg">{t.nome}</p>
                                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#C6A75E] font-medium mt-1">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
