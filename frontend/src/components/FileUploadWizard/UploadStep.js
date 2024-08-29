import React from 'react';
import { ArrowRight, Loader } from 'lucide-react';
import { handleUploadAndParse } from '../../utils/apiHelpers';

const UploadStep = ({ file, setFile, setError, isUploading, setIsUploading, setParsedSections, setKeywords, setCurrentStep }) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);
    setFile(selectedFile);
    setError(null);
  };

  const onUploadAndParse = async () => {
    await handleUploadAndParse(file, setIsUploading, setError, setParsedSections, setKeywords, setCurrentStep);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
      />
      <button
        onClick={onUploadAndParse}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
            Laster opp og parser...
          </>
        ) : (
          <>
            Last opp og parse <ArrowRight className="ml-2" size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default UploadStep;