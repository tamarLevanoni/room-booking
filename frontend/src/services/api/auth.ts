import { apiClient } from './client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from '../../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    // Logout will clear the refresh token cookie on the server
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout', {});
    return response.data;
  },

  refresh: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
    // Refresh token is sent automatically via cookie
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {});
    return response.data;
  },
};
