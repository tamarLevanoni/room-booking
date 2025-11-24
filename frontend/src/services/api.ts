import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RoomsResponse,
  RoomResponse,
  RoomAvailabilityResponse,
  BookingResponse,
  CreateBookingRequest,
  RoomSearchFilters,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        processQueue(new Error('No refresh token'));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { accessToken } = response.data.data;
          useAuthStore.getState().setTokens(accessToken);
          processQueue();
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        processQueue(refreshError as Error);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
    return response.data;
  },
};

// Room API
export const roomApi = {
  getRooms: async (): Promise<ApiResponse<RoomsResponse>> => {
    const response = await apiClient.get<ApiResponse<RoomsResponse>>('/rooms');
    return response.data;
  },

  searchRooms: async (filters: RoomSearchFilters): Promise<ApiResponse<RoomsResponse>> => {
    const response = await apiClient.get<ApiResponse<RoomsResponse>>('/rooms/search', {
      params: filters,
    });
    return response.data;
  },

  getRoom: async (id: string): Promise<ApiResponse<RoomResponse>> => {
    const response = await apiClient.get<ApiResponse<RoomResponse>>(`/rooms/${id}`);
    return response.data;
  },

  checkAvailability: async (
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<RoomAvailabilityResponse>> => {
    const response = await apiClient.get<ApiResponse<RoomAvailabilityResponse>>(
      `/rooms/${roomId}/availability`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },
};

// Booking API
export const bookingApi = {
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<BookingResponse>> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>('/bookings', data);
    return response.data;
  },
};

export default apiClient;
