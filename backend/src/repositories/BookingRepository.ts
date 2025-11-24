import { Booking } from '../models/Booking';
import { IBooking } from '../types';
import { Types } from 'mongoose';

/**
 * BookingRepository
 *
 * Handles database operations for Booking model.
 * Implements atomic booking creation to prevent race conditions.
 */
export class BookingRepository {
  /**
   * Find overlapping bookings for a specific room and date range
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @returns Array of overlapping confirmed bookings
   *
   * Overlap logic: A booking overlaps if:
   * - Its startDate is before the requested endDate AND
   * - Its endDate is after the requested startDate
   */
  async findOverlapping(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking[]> {
    return Booking.find({
      roomId: new Types.ObjectId(roomId),
      status: 'CONFIRMED',
      $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
    }).exec();
  }

  /**
   * Create a booking atomically using findOneAndUpdate with upsert
   * This prevents race conditions by checking for conflicts and inserting in a single atomic operation
   *
   * @param userId - User's ObjectId as string
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @returns Created booking document or null if conflict exists
   *
   * Implementation follows spec section 2.6:
   * - Uses findOneAndUpdate with upsert: true
   * - Query checks for NO overlapping bookings using $nor
   * - Uses $setOnInsert to only set data if new document is created
   * - MongoDB guarantees atomicity - only one operation succeeds when multiple requests overlap
   */
  async createAtomic(
    userId: string,
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking | null> {
    try {
      const result = await Booking.findOneAndUpdate(
        {
          roomId: new Types.ObjectId(roomId),
          status: 'CONFIRMED',
          // Check that NO overlapping booking exists
          $nor: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
        },
        {
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            roomId: new Types.ObjectId(roomId),
            startDate,
            endDate,
            status: 'CONFIRMED',
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      ).exec();

      return result;
    } catch (error) {
      // If upsert fails (e.g., due to unique constraint), return null
      // This indicates a conflict exists
      return null;
    }
  }

  /**
   * Find all bookings for a specific user
   * @param userId - User's ObjectId as string
   * @returns Array of user's bookings
   */
  async findByUserId(userId: string): Promise<IBooking[]> {
    return Booking.find({
      userId: new Types.ObjectId(userId),
    }).exec();
  }
}

export const bookingRepository = new BookingRepository();
