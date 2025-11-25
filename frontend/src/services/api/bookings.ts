import { apiClient } from './client';
import type {
  ApiResponse,
  BookingResponse,
  CreateBookingRequest,
} from '../../types';

export const bookingApi = {
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<BookingResponse>> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>('/bookings', data);
    return response.data;
  },
};
