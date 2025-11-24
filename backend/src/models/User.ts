import { Schema, model } from 'mongoose';
import { IUser } from '../types';

/**
 * User Schema
 *
 * Fields:
 * - email: unique identifier for user login
 * - password: bcrypt hashed password
 * - name: user's full name
 * - createdAt/updatedAt: automatic timestamps
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index: email (unique) - automatically created by unique: true in schema
// Additional explicit index for clarity
userSchema.index({ email: 1 }, { unique: true });

/**
 * User Model
 */
export const User = model<IUser>('User', userSchema);

export type { IUser };
