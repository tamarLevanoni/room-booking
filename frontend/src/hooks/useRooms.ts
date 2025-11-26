import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import type { RoomSearchFilters } from '../types';

const ROOMS_PER_PAGE = 5;

export const useRoomSearch = (filters: Omit<RoomSearchFilters, 'offset' | 'limit'>) => {
  return useInfiniteQuery({
    queryKey: ['rooms', 'search', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await roomApi.searchRooms({ ...filters, offset: pageParam, limit: ROOMS_PER_PAGE });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to search rooms');
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextOffset;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialPageParam: 0,
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
