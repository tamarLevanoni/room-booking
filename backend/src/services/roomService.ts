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
  private readonly CACHE_KEY_PREFIX = 'room:';
  // Pagination configuration
  private readonly DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_SIZE || '5', 10);
  private readonly MAX_LIMIT = parseInt(process.env.MAX_PAGE_SIZE || '100', 10);

  /**
   * Get all rooms (cached)
   * Results are cached for 5 minutes
   * Used internally by searchRooms for in-memory filtering
   *
   * @returns Array of all rooms
   */
  async getAllRooms(): Promise<IRoom[]> {
    const cacheKey = 'rooms:all';

    // Try to get from cache
    const cached = await cacheHelper.get<IRoom[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all rooms from database
    const rooms = await roomRepository.findAll();

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
   * Search rooms with filters and pagination
   *
   * Current strategy (optimized for small-medium scale):
   * - Caches all rooms in single key 'rooms:all'
   * - Filters applied in-memory (fast for < 10K rooms)
   * - Pagination applied after filtering
   *
   * Future optimization for scale (10K+ rooms):
   * - Move to DB filtering with indexes
   * - Cache per filter combination
   *
   * @param filters - Search filters
   * @returns Paginated array of rooms matching the filters
   */
  async searchRooms(filters: {
    city?: string;
    country?: string;
    capacity?: number;
    limit?: number;
    offset?: number;
  }): Promise<IRoom[]> {
    // Get all rooms from cache
    const allRooms = await this.getAllRooms();

    // Filter in-memory
    const filtered = allRooms.filter((room) => {
      if (filters.city && room.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.country && room.country.toLowerCase() !== filters.country.toLowerCase()) return false;
      if (filters.capacity && room.capacity < filters.capacity) return false;
      return true;
    });

    // Apply pagination
    const limit = Math.min(filters.limit ?? this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const offset = filters.offset ?? 0;

    return filtered.slice(offset, offset + limit);
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

  /**
   * Create a new room
   * Invalidates room list cache after creation
   *
   * @param roomData - Room creation data
   * @returns Created room document
   */
  async createRoom(roomData: {
    name: string;
    city: string;
    country: string;
    capacity: number;
  }): Promise<IRoom> {
    // Create the room
    const room = await roomRepository.create(roomData);

    // Invalidate cache for room list
    await cacheHelper.del('rooms:all');

    return room;
  }
}

export const roomService = new RoomService();
