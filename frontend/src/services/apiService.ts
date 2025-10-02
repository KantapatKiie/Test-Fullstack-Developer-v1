/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  AxiosError,
  type InternalAxiosRequestConfig
} from 'axios';
import toast from 'react-hot-toast';


class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: new Date() };

        // Log request in development
        if (import.meta.env.DEV) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          const duration = new Date().getTime() - ((response.config as any).metadata?.startTime?.getTime() || 0);
          console.log('✅ API Response:', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            duration: `${duration}ms`,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(
                `${this.api.defaults.baseURL}/auth/refresh`,
                { refresh_token: refreshToken }
              );

              const { access_token, refresh_token: newRefreshToken } = response.data;
              
              // Update tokens
              this.setTokens(access_token, newRefreshToken);
              
              // Process failed queue
              this.processFailedQueue(access_token, null);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.processFailedQueue(null, refreshError);
            this.clearTokens();
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private processFailedQueue(token: string | null, error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private handleApiError(error: AxiosError) {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status,
        message,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    }

    // Show user-friendly error messages
    switch (status) {
      case 400:
        toast.error(`Invalid request: ${message}`);
        break;
      case 401:
        toast.error('Your session has expired. Please log in again.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 409:
        toast.error(`Conflict: ${message}`);
        break;
      case 422:
        toast.error(`Validation error: ${message}`);
        break;
      case 500:
        toast.error('Internal server error. Please try again later.');
        break;
      default:
        if (status && status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(message || 'An unexpected error occurred.');
        }
    }
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private redirectToLogin() {
    // This will be handled by the auth context/store
    window.location.href = '/login';
  }

  // Public methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  public setAuthTokens(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken);
  }

  public logout() {
    this.clearTokens();
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get the axios instance for advanced usage
  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;