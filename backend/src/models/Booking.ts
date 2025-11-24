import { Schema, model } from 'mongoose';
import { IBooking, BookingStatus } from '../types';

/**
 * Booking Schema
 *
 * Fields:
 * - userId: reference to User who made the booking
 * - roomId: reference to Room being booked
 * - startDate: booking start date/time
 * - endDate: booking end date/time
 * - status: booking status (CONFIRMED or CANCELLED)
 * - version: for optimistic locking
 * - createdAt/updatedAt: automatic timestamps
 */
const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index: userId - speeds up user booking retrieval
bookingSchema.index({ userId: 1 });

// Compound Index: roomId + startDate + endDate - required for overlap detection
bookingSchema.index({ roomId: 1, startDate: 1, endDate: 1 });

// Unique Compound Index: roomId + startDate + endDate - prevents exact duplicates
bookingSchema.index(
  { roomId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

/**
 * Booking Model
 */
export const Booking = model<IBooking>('Booking', bookingSchema);

export type { IBooking, BookingStatus };
