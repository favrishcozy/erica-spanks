// services/api.ts
import axios from 'axios';
import config from '../config/api';

// Export centralized base URL for other modules
export const API_BASE_URL = config.API_BASE_URL;

// Enhanced API configuration with better defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Prefer httpOnly cookies in production; fallback to localStorage token for dev convenience
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        requestConfig.headers = requestConfig.headers || {};
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // For FormData, don't set Content-Type - let axios/browser handle it with boundary
      // Otherwise, set default JSON content type if not already set
      if (!(requestConfig.data instanceof FormData)) {
        requestConfig.headers = requestConfig.headers || {};
        if (!requestConfig.headers['Content-Type']) {
          requestConfig.headers['Content-Type'] = 'application/json';
        }
      } else {
        // For FormData, remove Content-Type so axios will set multipart/form-data with boundary
        requestConfig.headers = requestConfig.headers || {};
        delete requestConfig.headers['Content-Type'];
      }

      // Add request timestamp for debugging/tracing
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers['X-Request-Timestamp'] = Date.now();
    } catch (e) {
      // localStorage may be inaccessible in some environments
      // swallow error to avoid blocking requests
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('[AXIOS RESPONSE] Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const originalRequest = error?.config;
    console.log('[AXIOS RESPONSE] Error:', error?.response?.status, originalRequest?.url);

    // Handle auth errors centrally
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } catch (e) {}
    }

    const enhancedError = {
      message: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
      status: error?.response?.status,
      code: error?.code,
      details: error?.response?.data || null,
      timestamp: new Date().toISOString(),
      originalRequest: originalRequest?.url || null,
    } as any;

    return Promise.reject(enhancedError);
  }
);

// Utility function for handling API errors in components
export const handleApiError = (error: any, defaultMessage = 'Something went wrong') => {
  // Normalize error coming from axios interceptors
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.details?.message) return error.details.message;
  return defaultMessage;
};

// Mock products for fallback in development
// Mock products removed - all data from API

// Product endpoints with enhanced error handling
export const productAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID or slug
  getProduct: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get new arrivals
  getNewArrivals: async () => {
    try {
      const response = await api.get('/products/new-arrivals');
      return response.data;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  // Get best sellers
  getBestSellers: async () => {
    try {
      const response = await api.get('/products/best-sellers');
      return response.data;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string, params = {}) => {
    try {
      const response = await api.get(`/products/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm: string, params = {}) => {
    try {
      const response = await api.get('/products/search', { 
        params: { q: searchTerm, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching products for "${searchTerm}":`, error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Submit a review/rating
  submitRating: async (productId: string, reviewData: { rating: number; title: string; comment: string }) => {
    try {
      const response = await api.post(`/products/${productId}/rate`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting rating for product ${productId}:`, error);
      throw error;
    }
  },

  // Bulk fetch products by IDs. Tries a single API request first (/products?ids=1,2,3),
  // falls back to parallel getProduct calls if the endpoint isn't supported.
  getProductsByIds: async (ids: string[]) => {
    if (!ids || ids.length === 0) return { data: [] };

    try {
      // Try single request if backend supports comma-separated ids
      const response = await api.get('/products', { params: { ids: ids.join(',') } });
      return response.data;
    } catch (err) {
      console.warn('Bulk fetch failed, falling back to individual requests', err);
      try {
        const results = await Promise.all(ids.map(id => productAPI.getProduct(id).catch(e => ({ error: e }))));
        // Normalize results: some entries may be { data: product } or product directly
        const normalized = results.map(r => {
          if (r && (r as any).success && (r as any).data) return (r as any).data;
          return r;
        });
        return { data: normalized };
      } catch (e) {
        throw e;
      }
    }
  },

  // Add product review
  addProductReview: async (productId: string, review: any) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error(`Error adding review for product ${productId}:`, error);
      throw error;
    }
  },

  // Validate stock for cart items
  validateStock: async (items: { productId: string; size?: string; color?: string; quantity: number }[]) => {
    try {
      const response = await api.post('/products/validate-stock', { items });
      return response.data;
    } catch (error) {
      console.error('Error validating stock:', error);
      throw error;
    }
  },
};

// Auth endpoints (updated with new integration)
export const authAPI = {
  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('[AUTH API] Attempting login with email:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      console.log('[AUTH API] Login response status:', response.status);
      console.log('[AUTH API] Login response data:', response.data);
      
      // Store token if provided
      if (response.data.token) {
        console.log('[AUTH API] Storing token');
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        console.log('[AUTH API] Storing user data');
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('[AUTH API] Login error:', error);
      console.error('[AUTH API] Error details:', {
        status: (error as any)?.status,
        message: (error as any)?.message,
        details: (error as any)?.details,
      });
      throw error;
    }
  },

  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    preferences?: {
      newsletter?: boolean;
      smsMarketing?: boolean;
      emailMarketing?: boolean;
    };
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Clear local storage first
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Call logout endpoint if available
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
    }
  },

  // ... rest of your existing auth endpoints
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  addAddress: async (addressData: any) => {
    const response = await api.post('/auth/addresses', addressData);
    return response.data;
  },

  updateAddress: async (addressId: string, addressData: any) => {
    const response = await api.put(`/auth/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId: string) => {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Cart endpoints
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (item: any) => {
    try {
      const response = await api.post('/cart/items', item);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (itemId: string, updates: any) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating cart item ${itemId}:`, error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: string) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing cart item ${itemId}:`, error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};

// ... rest of your existing API endpoints (wishlistAPI, orderAPI, contactAPI, uploadAPI)

// Wishlist endpoints
export const wishlistAPI = {
  getWishlist: async () => {
    const response = await api.get('/auth/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: string) => {
    const response = await api.post('/auth/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string) => {
    const response = await api.delete(`/auth/wishlist/${productId}`);
    return response.data;
  },
};

// Order endpoints
export const orderAPI = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get orders for the authenticated user
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  retryPayment: async (orderId: string) => {
    const response = await api.post(`/orders/${orderId}/retry-payment`);
    return response.data;
  },

  createOrder: async (orderData: any) => {
    // Use extended timeout for order creation (includes email + payment init)
    const response = await api.post('/orders', orderData, { timeout: 45000 });
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

// Contact endpoints
export const contactAPI = {
  sendMessage: async (message: any) => {
    const response = await api.post('/contact', message);
    return response.data;
  },

  subscribeNewsletter: async (email: string) => {
    const response = await api.post('/newsletter/subscribe', { email });
    return response.data;
  },

  unsubscribeNewsletter: async (email: string) => {
    const response = await api.post('/newsletter/unsubscribe', { email });
    return response.data;
  },
};

// Shipping/Delivery endpoints
export const shippingAPI = {
  getZones: async () => {
    try {
      const response = await api.get('/shipping/zones');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      throw error;
    }
  },

  calculateFee: async (
    deliveryArea: string,
    deliveryMethod: 'delivery' | 'pickup' = 'delivery'
  ) => {
    try {
      const response = await api.post('/shipping/calculate', {
        deliveryArea,
        deliveryMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      throw error;
    }
  },
};

// Invoice endpoints
export const invoiceAPI = {
  getInvoices: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await api.get(`/invoices?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  getInvoice: async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  getOrderInvoice: async (orderId: string) => {
    try {
      const response = await api.get(`/invoices/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order invoice:', error);
      throw error;
    }
  },

  downloadPDF: async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  },

  createFromOrder: async (orderId: string, options?: any) => {
    try {
      const response = await api.post(`/invoices/create-from-order/${orderId}`, {
        options: options || {},
      });
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },
};

// Upload endpoints
export const uploadAPI = {
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadFiles: async (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Utility functions
export const imageUtils = {
  getOptimizedImageUrl: (publicId: string, options: { 
    width?: number; 
    height?: number; 
    quality?: string; 
    format?: string; 
    crop?: string;
  } = {}) => {
  if (!publicId) return '/placeholder-product.svg';
    
    const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
    
    let transformations = [];
    if (width || height) {
      transformations.push(`c_${crop}`);
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
    }
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    const transformString = transformations.length > 0 ? `/${transformations.join(',')}` : '';
    return `https://res.cloudinary.com/dtnyez4fk/image/upload${transformString}/${publicId}`;
  },

  getResponsiveImageUrls: (publicId: string) => {
    if (!publicId) return {
      small: '/placeholder-product.svg',
      medium: '/placeholder-product.svg',
      large: '/placeholder-product.svg',
    };

    return {
      small: imageUtils.getOptimizedImageUrl(publicId, { width: 400, height: 500 }),
      medium: imageUtils.getOptimizedImageUrl(publicId, { width: 600, height: 750 }),
      large: imageUtils.getOptimizedImageUrl(publicId, { width: 800, height: 1000 }),
    };
  },
};

// Export the base URL for debugging
export default api;
