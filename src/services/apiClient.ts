import axios from 'axios';

export class ApiError extends Error {
  status: number;
  fieldErrors?: { field: string; message: string }[];

  constructor(message: string, status = 400, fieldErrors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('keystone-session-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 & Error Parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('keystone:unauthorized'));
    }

    if (error.response?.data) {
      const data = error.response.data;
      // Expected backend shape: { timestamp, status, error, message, fieldErrors }
      throw new ApiError(
        data.message || 'An unexpected error occurred',
        data.status || error.response.status || 400,
        data.fieldErrors
      );
    }
    
    throw new ApiError(error.message || 'Network Error', 500);
  }
);
