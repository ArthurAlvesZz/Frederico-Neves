import React from 'react';
import MultiStepValuationForm from '../components/MultiStepValuationForm';

const Valuation = () => {
  return (
    <div className="pt-32 min-h-screen bg-background pb-32">
      <div className="container-custom max-w-2xl">
        <MultiStepValuationForm />
      </div>
    </div>
  );
};

export default Valuation;
