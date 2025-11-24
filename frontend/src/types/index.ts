// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Room types
export interface Room {
  _id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  _id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

// Auth API responses
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// Room API responses
export interface RoomsResponse {
  rooms: Room[];
}

export interface RoomResponse {
  room: Room;
}

export interface RoomAvailabilityResponse {
  is_available: boolean;
}

// Booking API responses
export interface BookingResponse {
  booking: Booking;
}

// Search filters
export interface RoomSearchFilters {
  city?: string;
  country?: string;
  capacity?: number;
  start?: string;
  end?: string;
}

// Auth request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Booking request types
export interface CreateBookingRequest {
  roomId: string;
  startDate: string;
  endDate: string;
}
