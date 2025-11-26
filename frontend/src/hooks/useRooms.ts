import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import type { RoomSearchFilters } from '../types';


export const useRoomSearch = (filters: RoomSearchFilters) => {
  return useQuery({
    queryKey: ['rooms', 'search', filters],
    queryFn: async () => {
      const response = await roomApi.searchRooms(filters);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to search rooms');
      }
      return response.data.rooms;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const response = await roomApi.getRoom(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch room');
      }
      return response.data.room;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

export const useRoomAvailability = (roomId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['rooms', roomId, 'availability', startDate, endDate],
    queryFn: async () => {
      const response = await roomApi.checkAvailability(roomId, startDate, endDate);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to check availability');
      }
      return response.data.is_available;
    },
    enabled: false, // Only run when explicitly called via refetch
    staleTime: 0, // Always fresh
  });
};
