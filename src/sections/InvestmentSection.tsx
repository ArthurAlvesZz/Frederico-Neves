import React from 'react';
import { motion } from 'motion/react';

const InvestmentSection = () => {
    return (
        <section className="py-24 bg-gray-950 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-[#C6A75E]/5 to-gray-950 pointer-events-none" />
            <div className="container-custom relative z-10 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
                        Imóveis como <span className="font-bold text-[#C6A75E] italic">estratégia patrimonial</span>
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                        A alocação em ativos reais continua sendo a base das maiores fortunas globais.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Proteção', desc: 'Blindagem de capital contra inflação a longo prazo e instabilidades financeiras estruturais.' },
                        { title: 'Valorização', desc: 'Foco metódico em áreas e regiões com alto potencial de crescimento estrutural.' },
                        { title: 'Renda Futura', desc: 'Ativos perfeitamente desenhados para atrair inquilinos premium e de alto poder aquisitivo.' },
                        { title: 'Segurança', desc: 'Reserva de valor tangível para consolidação e perpetuação e segurança das gerações futuras.' }
                    ].map((card, idx) => (
                        <div key={card.title} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[1.5rem] hover:bg-white/10 hover:border-[#C6A75E]/30 transition-all duration-300 group">
                            <div className="text-4xl font-bold text-white/[0.05] mb-2 tracking-tighter group-hover:text-[#C6A75E]/10 transition-colors">0{idx + 1}</div>
                            <h3 className="text-xl font-light text-white mb-3">{card.title}</h3>
                            <p className="text-gray-400 text-sm font-light leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InvestmentSection;
