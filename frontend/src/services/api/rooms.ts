import { apiClient } from './client';
import type {
  ApiResponse,
  RoomsResponse,
  RoomResponse,
  RoomAvailabilityResponse,
  RoomSearchFilters,
} from '../../types';

export const roomApi = {


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
