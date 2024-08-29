import React from 'react';
import { CheckCircle } from 'lucide-react';

const CompletionStep = () => {
  return (
    <div className="text-center">
      <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
      <p className="text-xl font-semibold text-white">Prosess fullført!</p>
      <p className="mt-2 text-gray-300">Filen din er behandlet og ZIP-filen er lastet ned.</p>
    </div>
  );
};

export default CompletionStep;