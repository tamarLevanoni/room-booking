import { Room } from '../models/Room';
import { IRoom } from '../types';

/**
 * RoomRepository
 *
 * Handles database operations for Room model.
 * Provides methods for room retrieval and searching with filters.
 */
export class RoomRepository {
  /**
   * Find all rooms with optional pagination
   * @param limit - Maximum number of rooms to return (optional)
   * @param offset - Number of rooms to skip (optional)
   * @returns Array of room documents
   */
  async findAll(limit?: number, offset?: number): Promise<IRoom[]> {
    let query = Room.find();

    if (offset !== undefined) {
      query = query.skip(offset);
    }

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  /**
   * Find a room by ID
   * @param id - Room's ObjectId as string
   * @returns Room document or null if not found
   */
  async findById(id: string): Promise<IRoom | null> {
    return Room.findById(id).exec();
  }

  /**
   * Search rooms with optional filters
   * @param filters - Search filters
   * @param filters.city - Filter by city (optional)
   * @param filters.country - Filter by country (optional)
   * @param filters.capacity - Filter by minimum capacity (optional)
   * @param filters.start - Start date for availability check (not used in DB query - for reference)
   * @param filters.end - End date for availability check (not used in DB query - for reference)
   * @returns Array of room documents matching the filters
   *
   * Note: start and end date parameters are included for API compatibility
   * but are not used in the database query. Availability filtering should be
   * done in-memory or via a separate availability check.
   */
  async search(filters: {
    city?: string;
    country?: string;
    capacity?: number;
    start?: Date;
    end?: Date;
  }): Promise<IRoom[]> {
    const query: Record<string, unknown> = {};

    if (filters.city) {
      query.city = filters.city;
    }

    if (filters.country) {
      query.country = filters.country;
    }

    if (filters.capacity !== undefined) {
      query.capacity = { $gte: filters.capacity };
    }

    return Room.find(query).exec();
  }
}

export const roomRepository = new RoomRepository();
