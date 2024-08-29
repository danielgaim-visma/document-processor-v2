import React, { useState, useEffect } from 'react';
import { Upload, Bot, Download } from 'lucide-react';
import { testServerConnection } from '../../utils/apiHelpers';
import StepIndicator from './StepIndicator';
import UploadStep from './UploadStep';
import ProcessStep from './ProcessStep';
import DownloadStep from './DownloadStep';
import CompletionStep from './CompletionStep';
import ErrorDisplay from './ErrorDisplay';

  const FileUploadWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedSections, setParsedSections] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [zipFilename, setZipFilename] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { name: 'Last opp fil', icon: Upload },
    { name: 'Behandle seksjoner', icon: Bot },
    { name: 'Last ned ZIP', icon: Download }
  ];

  useEffect(() => {
    testServerConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Dokumentbehandler</h1>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <ErrorDisplay error={error} />

        <div className="mt-8 bg-gray-700 p-6 rounded-lg">
          {currentStep === 0 && (
            <UploadStep
              file={file}
              setFile={setFile}
              setError={setError}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              setParsedSections={setParsedSections}
              setKeywords={setKeywords}
              setCurrentStep={setCurrentStep}
            />
          )}

          {currentStep === 1 && (
            <ProcessStep
              parsedSections={parsedSections}
              keywords={keywords}
              file={file}
              setZipFilename={setZipFilename}
              setError={setError}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              setCurrentStep={setCurrentStep}
            />
          )}

          {currentStep === 2 && (
            <DownloadStep
              zipFilename={zipFilename}
              setError={setError}
              setCurrentStep={setCurrentStep}
            />
          )}

          {currentStep === 3 && <CompletionStep />}
        </div>
      </div>
    </div>
  );
};

export default FileUploadWizard;