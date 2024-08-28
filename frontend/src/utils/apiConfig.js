
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  } else {
    return '';  // Empty string means same origin
  }
};

export const API_BASE_URL = getApiBaseUrl();