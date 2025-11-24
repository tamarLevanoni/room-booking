import { Document, Types } from 'mongoose';

/**
 * User TypeScript Interface
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Room TypeScript Interface
 */
export interface IRoom extends Document {
  _id: Types.ObjectId;
  name: string;
  city: string;
  country: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Status Type
 */
export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

/**
 * Booking TypeScript Interface
 */
export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roomId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
