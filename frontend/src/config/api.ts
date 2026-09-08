// src/config/api.ts

const getApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }

  throw new Error('VITE_API_URL must be set for production builds.');
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
