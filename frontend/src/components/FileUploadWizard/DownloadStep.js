import React from 'react';
import { Download } from 'lucide-react';
import { handleDownload } from '../../utils/apiHelpers';

const DownloadStep = ({ zipFilename, setError, setCurrentStep }) => {
  const onDownload = () => {
    handleDownload(zipFilename, setError, setCurrentStep);
  };

  return (
    <div>
      <p className="mb-4 text-gray-300">Seksjoner behandlet. Klikk under for å laste ned ZIP-fil.</p>
      <button
        onClick={onDownload}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
      >
        Last ned ZIP <Download className="ml-2" size={20} />
      </button>
    </div>
  );
};

export default DownloadStep;