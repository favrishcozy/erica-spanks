// src/config/api.ts

// Get API base URL from environment or use default
const getApiBaseUrl = (): string => {
  // Check for Vite environment variable
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
  IMAGE_BASE_URL: `${API_BASE_URL}/images`
};

export default config;
