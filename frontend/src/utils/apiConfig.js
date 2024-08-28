
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    return 'http://localhost:5000';
  } else if (hostname.includes('herokuapp.com')) {
    // Heroku deployment
    return `https://${hostname}`;
  } else {
    // Fall back to an environment variable or the production URL
    return process.env.REACT_APP_API_BASE_URL || 'https://dokumentbehandler-6c98c39a1c8a.herokuapp.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();