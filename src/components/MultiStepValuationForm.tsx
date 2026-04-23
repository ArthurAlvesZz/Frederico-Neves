import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const steps = [
  { id: 'location', title: 'Onde está localizada sua propriedade?', fields: ['address', 'region'] },
  { id: 'details', title: 'Detalhes da Propriedade', fields: ['beds', 'area'] },
  { id: 'contact', title: 'Como podemos te encontrar?', fields: ['name', 'whatsapp'] }
];

const MultiStepValuationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ address: '', region: '', beds: '', area: '', name: '', whatsapp: '' });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-4 block">Endereço Completo</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ex: Av. Vieira Souto, Rio de Janeiro" className="w-full p-4 border border-gray-200 outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-6 block">Região</label>
              <div className="flex flex-wrap gap-4">
                {['Jardins', 'Leblon', 'Trancoso', 'Fazenda Boa Vista', 'Ipanema'].map(region => (
                  <button key={region} onClick={() => setFormData({...formData, region})} className={`px-6 py-3 border text-sm font-medium transition-all ${formData.region === region ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-muted hover:border-primary'}`}>
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-4 block">Quartos</label>
              <input type="number" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} className="w-full p-4 border border-gray-200 outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-4 block">Área Construída (m²)</label>
              <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-4 border border-gray-200 outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-4 block">Nome Completo</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-200 outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-text text-sm font-bold uppercase tracking-widest mb-4 block">WhatsApp</label>
              <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="(11) 99999-9999" className="w-full p-4 border border-gray-200 outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-12">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-12">
              <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Passo {currentStep + 1} de {steps.length}</span>
              <h1 className="text-4xl font-bold text-text leading-tight">{steps[currentStep].title}</h1>
            </div>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 pt-10">
          {currentStep > 0 && <button onClick={prevStep} className="px-10 py-5 border border-text text-text font-bold uppercase tracking-widest hover:bg-text hover:text-white transition-colors">Voltar</button>}
          <button onClick={currentStep === steps.length - 1 ? () => alert('Lead capturado!') : nextStep} className="btn-primary flex-1 !py-5">
            {currentStep === steps.length - 1 ? 'Finalizar Avaliação' : 'Continuar'}
          </button>
        </div>
    </div>
  );
};

export default MultiStepValuationForm;
