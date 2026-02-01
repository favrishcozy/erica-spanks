// src/config/api.ts

// Get API base URL from environment or use default
const getApiBaseUrl = (): string => {
  // In development, check for .env.local first (local backend)
  if (import.meta.env.DEV && import.meta.env.VITE_API_URL === 'http://localhost:5000') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check for any Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default fallback for development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

const config = {
  API_BASE_URL: `${API_BASE_URL}/api`,
  API_URL: API_BASE_URL,
  IMAGE_BASE_URL: `${API_BASE_URL}/images`,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
