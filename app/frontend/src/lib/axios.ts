// Create/Update: app/frontend/src/lib/api.ts

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import TokenManager from '../services/TokenManager';

// Create axios instance with JWT authentication
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token to request headers
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 JWT token added to request');
    } else {
      console.log('⚠️ No JWT token found');
    }

    // Debug logging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle JWT authentication errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('📨 API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    });
    
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
    });
    
    // Special handling for auth errors
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing auth state and redirecting...');
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        // Clear JWT token and auth state
        TokenManager.removeToken();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('validatorId');
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the configured instance
export default api;

// Export additional helpers for Next.js
export const apiClient = api;

// Helper function for SSR-safe requests
export const serverSideRequest = async (url: string, options?: any) => {
  // For server-side requests, don't include JWT token
  const serverApi = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return serverApi(url, options);
};

// Helper function to check if we're on client side
export const isClient = () => typeof window !== 'undefined';

// Helper function to check if user has valid JWT token
export const hasValidToken = () => {
  return TokenManager.hasToken();
};