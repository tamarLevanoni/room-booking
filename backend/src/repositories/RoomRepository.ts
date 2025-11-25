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
   * Search rooms with filters and pagination
   * @param filters - Search filters
   * @param filters.city - Filter by city (optional)
   * @param filters.country - Filter by country (optional)
   * @param filters.capacity - Filter by minimum capacity (optional)
   * @param filters.limit - Maximum number of rooms to return (optional)
   * @param filters.offset - Number of rooms to skip (optional)
   * @returns Array of room documents matching the filters
   *
   * Uses MongoDB indexes on city+country for fast geographic filtering
   */
  async search(filters: {
    city?: string;
    country?: string;
    capacity?: number;
    limit?: number;
    offset?: number;
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

    let dbQuery = Room.find(query);

    if (filters.offset !== undefined) {
      dbQuery = dbQuery.skip(filters.offset);
    }

    if (filters.limit !== undefined) {
      dbQuery = dbQuery.limit(filters.limit);
    }

    return dbQuery.exec();
  }

  /**
   * Create a new room
   * @param roomData - Room creation data
   * @returns Created room document
   */
  async create(roomData: {
    name: string;
    city: string;
    country: string;
    capacity: number;
  }): Promise<IRoom> {
    const room = new Room(roomData);
    return room.save();
  }
}

export const roomRepository = new RoomRepository();
