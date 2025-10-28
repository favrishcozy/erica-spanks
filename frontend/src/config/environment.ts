// config/environment.ts
const getApiBaseUrl = (): string => {
    // Check for Vite environment variable
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Check for Create React App environment variable
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Check for Node.js environment variable
    if (process.env.API_URL) {
      return process.env.API_URL;
    }
    
    // Default fallback
    return 'http://localhost:5000';
  };
  
  export const API_BASE_URL = getApiBaseUrl();