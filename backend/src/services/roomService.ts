import { IRoom } from '../types';
import { roomRepository } from '../repositories/RoomRepository';
import { bookingRepository } from '../repositories/BookingRepository';
import { cacheHelper } from '../utils/cacheHelper';

/**
 * RoomService
 *
 * Handles business logic for rooms including caching, filtering, and availability checks.
 * Implements caching strategy as per spec section 2.2:
 * - Cache key: 'rooms:all' for list, 'room:{id}' for single room
 * - TTL: 5 minutes (300 seconds)
 * - searchRooms filters in-memory on cached room list
 */
export class RoomService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_KEY_ALL = 'rooms:all';
  private readonly CACHE_KEY_PREFIX = 'room:';

  /**
   * Get all rooms with optional pagination
   * Results are cached for 5 minutes
   *
   * @param limit - Maximum number of rooms to return (optional)
   * @param offset - Number of rooms to skip (optional)
   * @returns Array of rooms
   */
  async getAllRooms(limit?: number, offset?: number): Promise<IRoom[]> {
    // Build cache key that includes pagination params
    const cacheKey = limit !== undefined || offset !== undefined
      ? `${this.CACHE_KEY_ALL}:${limit ?? 'all'}:${offset ?? 0}`
      : this.CACHE_KEY_ALL;

    // Try to get from cache
    const cached = await cacheHelper.get<IRoom[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const rooms = await roomRepository.findAll(limit, offset);

    // Cache the result
    await cacheHelper.set(cacheKey, rooms, this.CACHE_TTL);

    return rooms;
  }

  /**
   * Get a single room by ID
   * Result is cached for 5 minutes
   *
   * @param id - Room's ObjectId as string
   * @returns Room document
   * @throws 404 error if room not found
   */
  async getRoomById(id: string): Promise<IRoom> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

    // Try to get from cache
    const cached = await cacheHelper.get<IRoom>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const room = await roomRepository.findById(id);

    if (!room) {
      const error = new Error('Room not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Cache the result
    await cacheHelper.set(cacheKey, room, this.CACHE_TTL);

    return room;
  }

  /**
   * Search rooms with filters
   * Filters are applied in-memory on the cached room list as per spec
   *
   * @param filters - Search filters
   * @param filters.city - Filter by city (optional)
   * @param filters.country - Filter by country (optional)
   * @param filters.capacity - Filter by minimum capacity (optional)
   * @param filters.start - Start date for validation (optional)
   * @param filters.end - End date for validation (optional)
   * @returns Array of rooms matching the filters
   * @throws 400 error if startDate >= endDate
   */
  async searchRooms(filters: {
    city?: string;
    country?: string;
    capacity?: number;
    start?: string;
    end?: string;
  }): Promise<IRoom[]> {
    // Validate dates if provided
    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);

      if (startDate >= endDate) {
        const error = new Error('Start date must be before end date');
        (error as any).statusCode = 400;
        throw error;
      }
    }

    // Get all rooms from cache (or fetch if not cached)
    const allRooms = await this.getAllRooms();

    // Filter in-memory
    let filteredRooms = allRooms;

    if (filters.city) {
      filteredRooms = filteredRooms.filter(
        (room) => room.city.toLowerCase() === filters.city!.toLowerCase()
      );
    }

    if (filters.country) {
      filteredRooms = filteredRooms.filter(
        (room) => room.country.toLowerCase() === filters.country!.toLowerCase()
      );
    }

    if (filters.capacity !== undefined) {
      filteredRooms = filteredRooms.filter(
        (room) => room.capacity >= filters.capacity!
      );
    }

    return filteredRooms;
  }

  /**
   * Check if a room is available for the specified date range
   * NO caching - direct DB read as per spec
   *
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date (ISO8601 string)
   * @param endDate - Booking end date (ISO8601 string)
   * @returns Object with is_available boolean
   * @throws 400 error if startDate >= endDate
   * @throws 404 error if room not found
   */
  async checkAvailability(
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<{ is_available: boolean }> {
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      const error = new Error('Start date must be before end date');
      (error as any).statusCode = 400;
      throw error;
    }

    // Verify room exists
    const room = await roomRepository.findById(roomId);
    if (!room) {
      const error = new Error('Room not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Check for overlapping bookings - direct DB read, no caching
    const overlappingBookings = await bookingRepository.findOverlapping(
      roomId,
      start,
      end
    );

    return {
      is_available: overlappingBookings.length === 0,
    };
  }
}

export const roomService = new RoomService();
