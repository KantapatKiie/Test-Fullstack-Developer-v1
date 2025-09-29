import apiService from './apiService';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../types/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    apiService.setAuthTokens(response.access_token, response.refresh_token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens
    apiService.setAuthTokens(response.access_token, response.refresh_token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await apiService.post<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );
    
    // Update tokens
    apiService.setAuthTokens(response.access_token, response.refresh_token);
    
    return response;
  }

  logout(): void {
    apiService.logout();
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return apiService.isAuthenticated() && !!this.getCurrentUser();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

const authService = new AuthService();
export default authService;