import { bookingRepository } from '../repositories/BookingRepository';
import { roomRepository } from '../repositories/RoomRepository';
import { cacheHelper } from '../utils/cacheHelper';
import { IBooking } from '../types';

/**
 * BookingService
 *
 * Handles business logic for booking operations.
 * Implements atomic booking creation and availability checks per spec sections 2.2, 2.3, and 2.6.
 */
export class BookingService {
  /**
   * Check if a room is available for the specified date range
   *
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @returns true if room is available, false otherwise
   * @throws Error with message if validation fails (400)
   *
   * Validation:
   * - startDate must be < endDate
   *
   * Per spec section 2.3: Check for overlapping bookings with status 'CONFIRMED'
   */
  async checkAvailability(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    // Validate dates
    if (startDate >= endDate) {
      const error = new Error('startDate must be before endDate');
      (error as any).statusCode = 400;
      throw error;
    }

    // Check for overlapping bookings
    const overlappingBookings = await bookingRepository.findOverlapping(
      roomId,
      startDate,
      endDate
    );

    return overlappingBookings.length === 0;
  }

  /**
   * Create a new booking atomically
   *
   * @param userId - User's ObjectId as string
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @returns Created booking document
   * @throws Error with statusCode property:
   *   - 400 if date validation fails
   *   - 404 if room not found
   *   - 409 if room already booked (conflict)
   *
   * Atomic booking logic per spec section 2.6:
   * 1. Verify room exists (404 if not)
   * 2. Validate startDate < endDate (400 if not)
   * 3. Use bookingRepository.createAtomic() for atomic operation
   * 4. If result is null → 409 Conflict "Room already booked for selected dates"
   * 5. Clear room cache after successful booking
   *
   * Cache invalidation:
   * - Invalidates 'rooms:all' (list cache)
   * - Invalidates 'room:{roomId}' (single room cache)
   */
  async createBooking(
    userId: string,
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking> {
    // Validate dates
    if (startDate >= endDate) {
      const error = new Error('startDate must be before endDate');
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

    // Create booking atomically
    // This operation checks for conflicts and creates the booking in a single atomic operation
    // If another request creates a conflicting booking between our check and insert, this will return null
    const booking = await bookingRepository.createAtomic(
      userId,
      roomId,
      startDate,
      endDate
    );

    // If booking is null, it means a conflict exists (another booking overlaps)
    if (!booking) {
      const error = new Error('Room already booked for selected dates');
      (error as any).statusCode = 409;
      throw error;
    }

    // Clear room cache after successful booking
    // This ensures availability checks get fresh data
    await this.invalidateRoomCache(roomId);

    return booking;
  }

  /**
   * Get all bookings for a specific user
   *
   * @param userId - User's ObjectId as string
   * @returns Array of user's bookings
   */
  async getUserBookings(userId: string): Promise<IBooking[]> {
    return bookingRepository.findByUserId(userId);
  }

  /**
   * Invalidate room cache entries
   *
   * @param roomId - Room's ObjectId as string
   * @private
   *
   * Clears:
   * - 'rooms:all' - list of all rooms
   * - 'room:{roomId}' - specific room details
   */
  private async invalidateRoomCache(roomId: string): Promise<void> {
    try {
      // Clear all rooms list cache
      await cacheHelper.del('rooms:all');

      // Clear specific room cache
      await cacheHelper.del(`room:${roomId}`);
    } catch (error) {
      // Log error but don't fail the booking operation
      console.error('Failed to invalidate room cache:', error);
    }
  }
}

export const bookingService = new BookingService();
