import { z } from 'zod';
import { Types } from 'mongoose';

/**
 * Custom Zod validator for MongoDB ObjectId
 */
const objectIdSchema = z.string().refine(
  (val) => Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
);

/**
 * Custom Zod validator for ISO8601 date strings
 */
const isoDateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid ISO8601 date format' }
);

// ========================================
// Authentication Schemas
// ========================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').trim()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// ========================================
// Room Schemas
// ========================================

export const getRoomsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const searchRoomsQuerySchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  capacity: z.string().regex(/^\d+$/).transform(Number).optional(),
  start: isoDateString.optional(),
  end: isoDateString.optional()
}).refine(
  (data) => {
    // If both start and end are provided, validate the range
    if (data.start && data.end) {
      return new Date(data.start) < new Date(data.end);
    }
    return true;
  },
  { message: 'start date must be before end date', path: ['start'] }
);

export const getRoomParamsSchema = z.object({
  id: objectIdSchema
});

export const checkAvailabilityQuerySchema = z.object({
  startDate: isoDateString,
  endDate: isoDateString
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'startDate must be before endDate', path: ['startDate'] }
);

// ========================================
// Booking Schemas
// ========================================

export const createBookingSchema = z.object({
  roomId: objectIdSchema,
  startDate: isoDateString,
  endDate: isoDateString
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'startDate must be before endDate', path: ['startDate'] }
);

// ========================================
// Type exports for use in route handlers
// ========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type GetRoomsQuery = z.infer<typeof getRoomsQuerySchema>;
export type SearchRoomsQuery = z.infer<typeof searchRoomsQuerySchema>;
export type GetRoomParams = z.infer<typeof getRoomParamsSchema>;
export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilityQuerySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
