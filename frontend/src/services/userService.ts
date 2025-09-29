import apiService from './apiService';
import type { User, UpdateUserRequest } from '../types/api';

class UserService {
  async getCurrentUserProfile(): Promise<User> {
    return apiService.get<User>('/users/profile');
  }

  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    return apiService.patch<User>('/users/profile', userData);
  }

  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/users/${id}`);
  }
}

const userService = new UserService();
export default userService;