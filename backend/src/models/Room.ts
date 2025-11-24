import { Schema, model } from 'mongoose';
import { IRoom } from '../types';

/**
 * Room Schema
 *
 * Fields:
 * - name: room identifier/name
 * - city: city where room is located
 * - country: country where room is located
 * - capacity: maximum number of people
 * - createdAt/updatedAt: automatic timestamps
 */
const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index: name - for fast room lookup
roomSchema.index({ name: 1 });

// Compound Index: city + country - supports fast geographic filtering
roomSchema.index({ city: 1, country: 1 });

/**
 * Room Model
 */
export const Room = model<IRoom>('Room', roomSchema);

export type { IRoom };
