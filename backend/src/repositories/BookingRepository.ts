import { Booking } from '../models/Booking';
import { IBooking } from '../types';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

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
   * Create a booking using MongoDB transactions
   * This prevents race conditions by checking and inserting within a single transaction
   *
   * @param userId - User's ObjectId as string
   * @param roomId - Room's ObjectId as string
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @returns Created booking document or null if conflict exists
   * @throws Error if transaction fails for reasons other than conflict
   *
   * Implementation follows spec section 2.6:
   * - Uses MongoDB transactions for ACID guarantees
   * - Checks for overlapping bookings within transaction
   * - Creates booking if no overlap found
   * - Returns null if conflict detected
   */
  async createBooking(
    userId: string,
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking | null> {
    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // Check for overlapping bookings within transaction
        const overlapping = await Booking.find({
          roomId: new Types.ObjectId(roomId),
          status: 'CONFIRMED',
          $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
          ],
        }).session(session);

        if (overlapping.length > 0) {
          // Conflict detected
          return null;
        }

        // Create booking within transaction
        const [booking] = await Booking.create([{
          userId: new Types.ObjectId(userId),
          roomId: new Types.ObjectId(roomId),
          startDate,
          endDate,
          status: 'CONFIRMED',
          version: 1,
        }], { session });

        return booking;
      });

      // If withTransaction returns undefined (not null), transaction failed
      if (result === undefined) {
        throw new Error('Transaction failed to complete');
      }

      // result is either IBooking or null (conflict)
      return result;
    } catch (error) {
      // Re-throw the error to be handled by the service layer
      throw error;
    } finally {
      session.endSession();
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
