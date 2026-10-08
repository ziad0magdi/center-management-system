import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Global response interceptor for clean error messages
apiClient.interceptors.response.use(
  response => response,
  error => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const enhancedError = new Error(customMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);
