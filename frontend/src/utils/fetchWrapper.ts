import { v4 as uuidv4 } from 'uuid';

interface FetchWrapperOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

interface FetchWrapperResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  headers: Headers;
}

/**
 * Fetch wrapper ที่เพิ่ม x-request-id และ Authorization headers อัตโนมัติ
 */
class FetchWrapper {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * สร้าง UUID สำหรับ request ID
   */
  private generateRequestId(): string {
    return uuidv4();
  }

  /**
   * ดึง access token จาก localStorage
   */
  private getAccessToken(): string | null {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken || null;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return null;
  }

  /**
   * สร้าง headers สำหรับ request
   */
  private buildHeaders(customHeaders: Record<string, string> = {}, includeAuth: boolean = true): Headers {
    const headers = new Headers();
    
    // เพิ่ม x-request-id UUID
    headers.set('x-request-id', this.generateRequestId());
    
    // เพิ่ม Content-Type default
    if (!customHeaders['Content-Type'] && !customHeaders['content-type']) {
      headers.set('Content-Type', 'application/json');
    }

    // เพิ่ม Authorization header ถ้าต้องการ
    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // เพิ่ม custom headers
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return headers;
  }

  /**
   * Core fetch method
   */
  private async request<T>(
    url: string,
    options: FetchWrapperOptions = {}
  ): Promise<FetchWrapperResponse<T>> {
    const { headers: customHeaders = {}, includeAuth = true, ...fetchOptions } = options;
    
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const headers = this.buildHeaders(customHeaders, includeAuth);

    try {
      console.log(`[FetchWrapper] ${fetchOptions.method || 'GET'} ${fullUrl}`, {
        requestId: headers.get('x-request-id'),
        hasAuth: headers.has('Authorization')
      });

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers
      });

      let data: T | undefined;
      let error: string | undefined;

      // พยายาม parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        
        if (response.ok) {
          data = jsonData;
        } else {
          error = jsonData.message || jsonData.error || `HTTP ${response.status}`;
        }
      } else {
        const textData = await response.text();
        if (response.ok) {
          data = textData as unknown as T;
        } else {
          error = textData || `HTTP ${response.status}`;
        }
      }

      return {
        data,
        error,
        status: response.status,
        headers: response.headers
      };

    } catch (err) {
      console.error('[FetchWrapper] Network error:', err);
      return {
        error: err instanceof Error ? err.message : 'Network error',
        status: 0,
        headers: new Headers()
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options: Omit<FetchWrapperOptions, 'method' | 'body'> = {}): Promise<FetchWrapperResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, options: Omit<FetchWrapperOptions, 'method'> = {}): Promise<FetchWrapperResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, options: Omit<FetchWrapperOptions, 'method'> = {}): Promise<FetchWrapperResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options: Omit<FetchWrapperOptions, 'method' | 'body'> = {}): Promise<FetchWrapperResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, options: Omit<FetchWrapperOptions, 'method'> = {}): Promise<FetchWrapperResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }
}

// สร้าง instance สำหรับ backend API
export const fetchWrapper = new FetchWrapper('http://localhost:3000/api');

// Export class สำหรับสร้าง instance อื่นๆ
export { FetchWrapper };

// Export types
export type { FetchWrapperOptions, FetchWrapperResponse };