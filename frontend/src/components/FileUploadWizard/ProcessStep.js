import React from 'react';
import { ArrowRight, Loader } from 'lucide-react';
import { handleProcessSections } from '../../utils/apiHelpers';

const ProcessStep = ({
  parsedSections,
  keywords,
  file,
  setZipFilename,
  setError,
  isProcessing,
  setIsProcessing,
  setCurrentStep
}) => {
  const onProcessSections = async () => {
    await handleProcessSections(
      parsedSections,
      keywords,
      file,
      setZipFilename,
      setError,
      setIsProcessing,
      setCurrentStep
    );
  };

  return (
    <div>
      <p className="mb-4 text-gray-300">Fil parset vellykket. Klikk under for å behandle seksjoner.</p>
      <button
        onClick={onProcessSections}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
            Behandler seksjoner...
          </>
        ) : (
          <>
            Behandle seksjoner <ArrowRight className="ml-2" size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default ProcessStep;