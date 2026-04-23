import React from 'react';

const ExclusivitySection = () => {
    return (
        <section className="py-32 text-white text-center relative overflow-hidden">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://img.freepik.com/fotos-gratis/villa-de-luxo_1258-150759.jpg?semt=ais_hybrid&w=2000&q=80" 
                    alt="Villa de Luxo Exclusiva" 
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay to make text readable */}
                <div className="absolute inset-0 bg-[#0A2540]/85 backdrop-blur-[2px]" />
            </div>

            <div className="container-custom max-w-3xl relative z-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-8">
                    Oportunidades em <span className="font-bold text-[#C6A75E] italic">Acesso Privado</span>
                </h2>
                <p className="text-gray-300 mb-12 text-lg md:text-xl font-light leading-relaxed">
                    Algumas propriedades nunca chegam ao mercado público. Garantimos acesso antecipado exclusivo para nossos clientes de carteira privada através do sistema <span className="font-semibold text-white">Off-Market</span>.
                </p>
                <a 
                    href="https://wa.me/553492515354" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#C6A75E] text-gray-950 font-bold text-lg hover:bg-[#b09350] transition-colors shadow-2xl"
                >
                    Solicitar acesso à carteira privada
                </a>
            </div>
        </section>
    );
};

export default ExclusivitySection;
