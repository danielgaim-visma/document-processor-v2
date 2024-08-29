import { API_BASE_URL } from './apiConfig';

export const testServerConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.text();
    console.log("Server connection test result:", data);
  } catch (error) {
    console.error("Server connection test failed:", error);
  }
};

export const handleUploadAndParse = async (file, setIsUploading, setError, setParsedSections, setKeywords, setCurrentStep) => {
  if (!file) return;

  setIsUploading(true);
  setError(null);
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log("Sending request to server...");
    console.log("Request URL:", `${API_BASE_URL}/api/upload-and-parse`);
    console.log("File being sent:", file);

    const response = await fetch(`${API_BASE_URL}/api/upload-and-parse`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    console.log("Response received:", response);

    if (response.ok) {
      const data = await response.json();
      console.log("Parsed data:", data);
      setParsedSections(data.parsed_sections);
      setKeywords(data.keywords);
      setCurrentStep(1);
    } else {
      const errorText = await response.text();
      console.error('Server responded with an error:', response.status, errorText);
      setError(`Filopplasting og parsing mislyktes: ${errorText} (Status: ${response.status})`);
    }
  } catch (error) {
    console.error('Network error:', error);
    setError(`Nettverksfeil ved opplasting og parsing av fil: ${error.message}`);
  } finally {
    setIsUploading(false);
  }
};

export const handleProcessSections = async (parsedSections, keywords, file, setZipFilename, setError, setIsProcessing, setCurrentStep) => {
  setIsProcessing(true);
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
      setZipFilename(data.zip_file);
      setCurrentStep(2);
    } else {
      const errorData = await response.json();
      console.error('Behandling av seksjoner mislyktes:', response.status, errorData);
      setError(`Behandling av seksjoner mislyktes: ${errorData.error || 'Ukjent feil'}`);
    }
  } catch (error) {
    console.error('Feil ved behandling av seksjoner:', error);
    setError(`Feil ved behandling av seksjoner: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};

export const handleDownload = (zipFilename, setError, setCurrentStep) => {
  if (!zipFilename) {
    setError('Ingen ZIP-fil tilgjengelig for nedlasting');
    return;
  }
  window.location.href = `${API_BASE_URL}/api/download/${zipFilename}`;
  setCurrentStep(3);
};