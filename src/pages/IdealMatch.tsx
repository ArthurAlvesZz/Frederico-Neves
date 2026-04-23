import React from 'react';

const IdealMatch = () => {
  return (
    <div className="pt-32 min-h-screen bg-background pb-32">
      <div className="container-custom max-w-3xl">
        <div className="mb-20">
          <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Match do Lar</span>
          <h1 className="text-5xl font-bold text-text mb-8 leading-tight">Qual é o seu <br /><span className="italic font-light">refúgio ideal?</span></h1>
        </div>

        <div className="grid gap-6">
          {[
            { t: 'Beira-mar', d: 'Acordar com o som do oceano e brisa marinha.', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80' },
            { t: 'Centro Urbano', d: 'No pulsar da metrópole e centros culturais.', img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80' },
            { t: 'Campo Isolado', d: 'Privacidade absoluta cercada por natureza.', img: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?w=600&q=80' }
          ].map(opt => (
            <button key={opt.t} className="relative h-32 group overflow-hidden border border-gray-100 transition-all hover:border-primary">
              <img src={opt.img} className="absolute inset-0 w-full h-full object-cover opacity-10 transition-opacity group-hover:opacity-20" alt={opt.t} />
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-text">{opt.t}</h3>
                  <p className="text-muted text-sm">{opt.d}</p>
                </div>
                <div className="w-6 h-6 rounded-full border border-gray-200 group-hover:border-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-20 flex justify-between items-center">
            <button className="text-muted text-xs font-bold uppercase tracking-widest hover:text-text transition-colors">Pular</button>
            <button className="btn-gold">Continuar</button>
        </div>
      </div>
    </div>
  );
};

export default IdealMatch;
