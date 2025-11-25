import { z } from 'zod';

/**
 * Custom Zod validators and schemas for API endpoint validation
 */

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * Validates MongoDB ObjectId format (24 hex characters)
 */
export const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid ObjectId format'
);

/**
 * Validates ISO8601 date string format
 */
export const iso8601DateSchema = z.string().datetime({
  offset: true,
  message: 'Invalid ISO8601 date format'
});

/**
 * Custom refine function to validate that start date is before end date
 */
export const validateDateRange = <T extends { startDate: string; endDate: string }>(
  data: T
): boolean => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
};

// ============================================================================
// Auth Schemas
// ============================================================================

/**
 * POST /api/auth/register
 * Validates user registration input
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long')
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * POST /api/auth/login
 * Validates user login input
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * POST /api/auth/refresh
 * Validates refresh token input
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================================================
// Room Schemas
// ============================================================================

/**
 * GET /api/rooms
 * Validates pagination query parameters
 */
export const getRoomsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive('Limit must be positive').optional()),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().nonnegative('Offset must be non-negative').optional())
});

export type GetRoomsQuery = z.infer<typeof getRoomsQuerySchema>;

/**
 * GET /api/rooms/search
 * Validates room search query parameters with optional date range
 */
export const searchRoomsQuerySchema = z
  .object({
    city: z.string().optional(),
    country: z.string().optional(),
    capacity: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(z.number().positive('Capacity must be positive').optional()),
    start: iso8601DateSchema.optional(),
    end: iso8601DateSchema.optional()
  })
  .refine(
    (data) => {
      // If both start and end are provided, validate the range
      if (data.start && data.end) {
        return validateDateRange({ startDate: data.start, endDate: data.end });
      }
      // If only one is provided, that's invalid
      if (data.start || data.end) {
        return false;
      }
      // If neither is provided, that's valid
      return true;
    },
    {
      message: 'Both start and end dates must be provided, and start must be before end',
      path: ['start']
    }
  );

export type SearchRoomsQuery = z.infer<typeof searchRoomsQuerySchema>;

/**
 * GET /api/rooms/:id
 * Validates room ID path parameter
 */
export const getRoomParamsSchema = z.object({
  id: objectIdSchema
});

export type GetRoomParams = z.infer<typeof getRoomParamsSchema>;

/**
 * GET /api/rooms/:id/availability
 * Validates availability check query parameters with date range validation
 */
export const checkAvailabilityQuerySchema = z
  .object({
    startDate: iso8601DateSchema,
    endDate: iso8601DateSchema
  })
  .refine((data) => validateDateRange(data), {
    message: 'Start date must be before end date',
    path: ['startDate']
  });

export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilityQuerySchema>;

// ============================================================================
// Booking Schemas
// ============================================================================

/**
 * POST /api/bookings
 * Validates booking creation input with date range validation
 */
export const createBookingSchema = z
  .object({
    roomId: objectIdSchema,
    startDate: iso8601DateSchema,
    endDate: iso8601DateSchema
  })
  .refine((data) => validateDateRange(data), {
    message: 'Start date must be before end date',
    path: ['startDate']
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ============================================================================
// Validation Helper Function
// ============================================================================

/**
 * Generic validation helper that parses data with a Zod schema
 * and throws a formatted error if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws Error with formatted validation error messages
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message
    }));

    throw new Error(
      `Validation failed: ${errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`
    );
  }

  return result.data;
}
