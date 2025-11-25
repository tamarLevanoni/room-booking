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

export const searchRoomsQuerySchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  capacity: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional()
});

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

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  capacity: z.number().int('Capacity must be an integer').min(1, 'Capacity must be at least 1')
});

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
export type SearchRoomsQuery = z.infer<typeof searchRoomsQuerySchema>;
export type GetRoomParams = z.infer<typeof getRoomParamsSchema>;
export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilityQuerySchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
