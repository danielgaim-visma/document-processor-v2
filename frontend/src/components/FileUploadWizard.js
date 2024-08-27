import React, { useState } from 'react';
import { ArrowRight, Upload, FileText, Bot, Download, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000'; // Update this if your backend is on a different host/port

const steps = [
  { name: 'Upload File', icon: Upload },
  { name: 'Process Sections', icon: Bot },
  { name: 'Download ZIP', icon: Download }
];

export default function FileUploadWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedSections, setParsedSections] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [zipFileName, setZipFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null); // Clear any previous errors
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-and-parse`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setParsedSections(data.parsed_sections);
        setKeywords(data.keywords);
        setCurrentStep(1);
      } else {
        const errorData = await response.json();
        console.error('File upload and parsing failed:', response.status, errorData);
        setError(`File upload and parsing failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading and parsing file:', error);
      setError(`Error uploading and parsing file: ${error.message}`);
    }
  };

  const handleProcessSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/process-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsed_sections: parsedSections,
          keywords: keywords,
          original_filename: file.name
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setZipFileName(data.zip_file);
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        console.error('Processing sections failed:', response.status, errorData);
        setError(`Processing sections failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing sections:', error);
      setError(`Error processing sections: ${error.message}`);
    }
  };

  const handleDownload = () => {
    if (!zipFileName) {
      setError('No ZIP file available for download');
      return;
    }
    window.location.href = `${API_BASE_URL}/api/download/${zipFileName}`;
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Document Processor</h1>

        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center">
                <div className={`rounded-full transition duration-500 ease-in-out h-16 w-16 flex items-center justify-center border-2 ${
                  index <= currentStep ? 'border-blue-400 bg-blue-900' : 'border-gray-600 bg-gray-700'
                }`}>
                  <step.icon size={24} className={index <= currentStep ? 'text-blue-400' : 'text-gray-400'} />
                </div>
                <div className="text-center mt-4">
                  <span className={`text-xs font-medium uppercase ${
                    index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 bg-gray-700 p-6 rounded-lg">
          {currentStep === 0 && (
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
              />
              <button
                onClick={handleUploadAndParse}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                disabled={!file}
              >
                Upload and Parse <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <p className="mb-4 text-gray-300">File parsed successfully. Click below to process sections.</p>
              <button
                onClick={handleProcessSections}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                Process Sections <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <p className="mb-4 text-gray-300">Sections processed. Click below to download ZIP file.</p>
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                Download ZIP <Download className="ml-2" size={20} />
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl font-semibold text-white">Process Complete!</p>
              <p className="mt-2 text-gray-300">Your file has been processed and the ZIP file downloaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}