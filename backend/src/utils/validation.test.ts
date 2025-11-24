import { describe, it, expect } from 'vitest';
import {
  objectIdSchema,
  iso8601DateSchema,
  validateDateRange,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  getRoomsQuerySchema,
  searchRoomsQuerySchema,
  getRoomParamsSchema,
  checkAvailabilityQuerySchema,
  createBookingSchema,
  validateData
} from './validation';

describe('Custom Validators', () => {
  describe('objectIdSchema', () => {
    it('should validate valid MongoDB ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(objectIdSchema.parse(validId)).toBe(validId);
    });

    it('should reject invalid ObjectId - too short', () => {
      expect(() => objectIdSchema.parse('123')).toThrow('Invalid ObjectId format');
    });

    it('should reject invalid ObjectId - too long', () => {
      expect(() => objectIdSchema.parse('507f1f77bcf86cd7994390111')).toThrow(
        'Invalid ObjectId format'
      );
    });

    it('should reject invalid ObjectId - non-hex characters', () => {
      expect(() => objectIdSchema.parse('507f1f77bcf86cd79943901g')).toThrow(
        'Invalid ObjectId format'
      );
    });

    it('should accept uppercase hex characters', () => {
      const validId = '507F1F77BCF86CD799439011';
      expect(objectIdSchema.parse(validId)).toBe(validId);
    });
  });

  describe('iso8601DateSchema', () => {
    it('should validate valid ISO8601 date string', () => {
      const validDate = '2024-11-24T10:00:00.000Z';
      expect(iso8601DateSchema.parse(validDate)).toBe(validDate);
    });

    it('should validate ISO8601 date with timezone offset', () => {
      const validDate = '2024-11-24T10:00:00+02:00';
      expect(iso8601DateSchema.parse(validDate)).toBe(validDate);
    });

    it('should reject invalid date format', () => {
      expect(() => iso8601DateSchema.parse('2024-11-24')).toThrow(
        'Invalid ISO8601 date format'
      );
    });

    it('should reject non-date string', () => {
      expect(() => iso8601DateSchema.parse('not-a-date')).toThrow(
        'Invalid ISO8601 date format'
      );
    });
  });

  describe('validateDateRange', () => {
    it('should return true when start date is before end date', () => {
      const data = {
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(validateDateRange(data)).toBe(true);
    });

    it('should return false when start date is after end date', () => {
      const data = {
        startDate: '2024-11-25T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(validateDateRange(data)).toBe(false);
    });

    it('should return false when start date equals end date', () => {
      const data = {
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(validateDateRange(data)).toBe(false);
    });
  });
});

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration input', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      };
      expect(registerSchema.parse(validInput)).toEqual(validInput);
    });

    it('should reject invalid email format', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe'
      };
      expect(() => registerSchema.parse(invalidInput)).toThrow('Invalid email format');
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: 'pass123',
        name: 'John Doe'
      };
      expect(() => registerSchema.parse(invalidInput)).toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject empty name', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: 'password123',
        name: ''
      };
      expect(() => registerSchema.parse(invalidInput)).toThrow('Name is required');
    });

    it('should reject name that is too long', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'a'.repeat(101)
      };
      expect(() => registerSchema.parse(invalidInput)).toThrow('Name is too long');
    });

    it('should reject missing fields', () => {
      expect(() => registerSchema.parse({})).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login input', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123'
      };
      expect(loginSchema.parse(validInput)).toEqual(validInput);
    });

    it('should reject invalid email format', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123'
      };
      expect(() => loginSchema.parse(invalidInput)).toThrow('Invalid email format');
    });

    it('should reject empty password', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: ''
      };
      expect(() => loginSchema.parse(invalidInput)).toThrow('Password is required');
    });

    it('should reject missing fields', () => {
      expect(() => loginSchema.parse({})).toThrow();
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token input', () => {
      const validInput = {
        refreshToken: 'valid-refresh-token'
      };
      expect(refreshTokenSchema.parse(validInput)).toEqual(validInput);
    });

    it('should reject empty refresh token', () => {
      const invalidInput = {
        refreshToken: ''
      };
      expect(() => refreshTokenSchema.parse(invalidInput)).toThrow(
        'Refresh token is required'
      );
    });

    it('should reject missing refresh token', () => {
      expect(() => refreshTokenSchema.parse({})).toThrow();
    });
  });
});

describe('Room Schemas', () => {
  describe('getRoomsQuerySchema', () => {
    it('should validate valid query with limit and offset', () => {
      const validQuery = {
        limit: '10',
        offset: '0'
      };
      const result = getRoomsQuerySchema.parse(validQuery);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should validate query with only limit', () => {
      const validQuery = {
        limit: '20'
      };
      const result = getRoomsQuerySchema.parse(validQuery);
      expect(result.limit).toBe(20);
      expect(result.offset).toBeUndefined();
    });

    it('should validate query with only offset', () => {
      const validQuery = {
        offset: '5'
      };
      const result = getRoomsQuerySchema.parse(validQuery);
      expect(result.limit).toBeUndefined();
      expect(result.offset).toBe(5);
    });

    it('should validate empty query', () => {
      const result = getRoomsQuerySchema.parse({});
      expect(result.limit).toBeUndefined();
      expect(result.offset).toBeUndefined();
    });

    it('should reject negative limit', () => {
      const invalidQuery = {
        limit: '-1'
      };
      expect(() => getRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Limit must be positive'
      );
    });

    it('should reject negative offset', () => {
      const invalidQuery = {
        offset: '-1'
      };
      expect(() => getRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Offset must be non-negative'
      );
    });

    it('should reject zero limit', () => {
      const invalidQuery = {
        limit: '0'
      };
      expect(() => getRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Limit must be positive'
      );
    });

    it('should accept zero offset', () => {
      const validQuery = {
        offset: '0'
      };
      const result = getRoomsQuerySchema.parse(validQuery);
      expect(result.offset).toBe(0);
    });
  });

  describe('searchRoomsQuerySchema', () => {
    it('should validate query with all optional fields', () => {
      const validQuery = {
        city: 'New York',
        country: 'USA',
        capacity: '10',
        start: '2024-11-24T10:00:00.000Z',
        end: '2024-11-25T10:00:00.000Z'
      };
      const result = searchRoomsQuerySchema.parse(validQuery);
      expect(result.city).toBe('New York');
      expect(result.country).toBe('USA');
      expect(result.capacity).toBe(10);
      expect(result.start).toBe('2024-11-24T10:00:00.000Z');
      expect(result.end).toBe('2024-11-25T10:00:00.000Z');
    });

    it('should validate query with only city', () => {
      const validQuery = {
        city: 'New York'
      };
      expect(searchRoomsQuerySchema.parse(validQuery)).toEqual(validQuery);
    });

    it('should validate query with only capacity', () => {
      const validQuery = {
        capacity: '5'
      };
      const result = searchRoomsQuerySchema.parse(validQuery);
      expect(result.capacity).toBe(5);
    });

    it('should validate empty query', () => {
      const result = searchRoomsQuerySchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject query with only start date', () => {
      const invalidQuery = {
        start: '2024-11-24T10:00:00.000Z'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Both start and end dates must be provided'
      );
    });

    it('should reject query with only end date', () => {
      const invalidQuery = {
        end: '2024-11-25T10:00:00.000Z'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Both start and end dates must be provided'
      );
    });

    it('should reject when start date is after end date', () => {
      const invalidQuery = {
        start: '2024-11-25T10:00:00.000Z',
        end: '2024-11-24T10:00:00.000Z'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'start must be before end'
      );
    });

    it('should reject when start date equals end date', () => {
      const invalidQuery = {
        start: '2024-11-24T10:00:00.000Z',
        end: '2024-11-24T10:00:00.000Z'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'start must be before end'
      );
    });

    it('should reject negative capacity', () => {
      const invalidQuery = {
        capacity: '-5'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Capacity must be positive'
      );
    });

    it('should reject zero capacity', () => {
      const invalidQuery = {
        capacity: '0'
      };
      expect(() => searchRoomsQuerySchema.parse(invalidQuery)).toThrow(
        'Capacity must be positive'
      );
    });
  });

  describe('getRoomParamsSchema', () => {
    it('should validate valid ObjectId', () => {
      const validParams = {
        id: '507f1f77bcf86cd799439011'
      };
      expect(getRoomParamsSchema.parse(validParams)).toEqual(validParams);
    });

    it('should reject invalid ObjectId', () => {
      const invalidParams = {
        id: 'invalid-id'
      };
      expect(() => getRoomParamsSchema.parse(invalidParams)).toThrow(
        'Invalid ObjectId format'
      );
    });

    it('should reject missing id', () => {
      expect(() => getRoomParamsSchema.parse({})).toThrow();
    });
  });

  describe('checkAvailabilityQuerySchema', () => {
    it('should validate valid date range', () => {
      const validQuery = {
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(checkAvailabilityQuerySchema.parse(validQuery)).toEqual(validQuery);
    });

    it('should reject when start date is after end date', () => {
      const invalidQuery = {
        startDate: '2024-11-25T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow(
        'Start date must be before end date'
      );
    });

    it('should reject when start date equals end date', () => {
      const invalidQuery = {
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow(
        'Start date must be before end date'
      );
    });

    it('should reject invalid date format in startDate', () => {
      const invalidQuery = {
        startDate: '2024-11-24',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow(
        'Invalid ISO8601 date format'
      );
    });

    it('should reject invalid date format in endDate', () => {
      const invalidQuery = {
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow(
        'Invalid ISO8601 date format'
      );
    });

    it('should reject missing startDate', () => {
      const invalidQuery = {
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow();
    });

    it('should reject missing endDate', () => {
      const invalidQuery = {
        startDate: '2024-11-24T10:00:00.000Z'
      };
      expect(() => checkAvailabilityQuerySchema.parse(invalidQuery)).toThrow();
    });
  });
});

describe('Booking Schemas', () => {
  describe('createBookingSchema', () => {
    it('should validate valid booking input', () => {
      const validInput = {
        roomId: '507f1f77bcf86cd799439011',
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(createBookingSchema.parse(validInput)).toEqual(validInput);
    });

    it('should reject invalid roomId', () => {
      const invalidInput = {
        roomId: 'invalid-id',
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(() => createBookingSchema.parse(invalidInput)).toThrow(
        'Invalid ObjectId format'
      );
    });

    it('should reject when start date is after end date', () => {
      const invalidInput = {
        roomId: '507f1f77bcf86cd799439011',
        startDate: '2024-11-25T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(() => createBookingSchema.parse(invalidInput)).toThrow(
        'Start date must be before end date'
      );
    });

    it('should reject when start date equals end date', () => {
      const invalidInput = {
        roomId: '507f1f77bcf86cd799439011',
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-24T10:00:00.000Z'
      };
      expect(() => createBookingSchema.parse(invalidInput)).toThrow(
        'Start date must be before end date'
      );
    });

    it('should reject invalid date format in startDate', () => {
      const invalidInput = {
        roomId: '507f1f77bcf86cd799439011',
        startDate: '2024-11-24',
        endDate: '2024-11-25T10:00:00.000Z'
      };
      expect(() => createBookingSchema.parse(invalidInput)).toThrow(
        'Invalid ISO8601 date format'
      );
    });

    it('should reject invalid date format in endDate', () => {
      const invalidInput = {
        roomId: '507f1f77bcf86cd799439011',
        startDate: '2024-11-24T10:00:00.000Z',
        endDate: '2024-11-25'
      };
      expect(() => createBookingSchema.parse(invalidInput)).toThrow(
        'Invalid ISO8601 date format'
      );
    });

    it('should reject missing fields', () => {
      expect(() => createBookingSchema.parse({})).toThrow();
    });
  });
});

describe('validateData Helper', () => {
  it('should return parsed data on successful validation', () => {
    const schema = registerSchema;
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe'
    };
    const result = validateData(schema, validData);
    expect(result).toEqual(validData);
  });

  it('should throw formatted error on validation failure', () => {
    const schema = registerSchema;
    const invalidData = {
      email: 'invalid-email',
      password: 'short',
      name: ''
    };
    expect(() => validateData(schema, invalidData)).toThrow('Validation failed');
  });

  it('should include field paths in error message', () => {
    const schema = registerSchema;
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
      name: 'John Doe'
    };
    try {
      validateData(schema, invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('email');
      expect((error as Error).message).toContain('Invalid email format');
    }
  });

  it('should handle nested validation errors', () => {
    const schema = createBookingSchema;
    const invalidData = {
      roomId: 'invalid-id',
      startDate: '2024-11-24T10:00:00.000Z',
      endDate: '2024-11-25T10:00:00.000Z'
    };
    expect(() => validateData(schema, invalidData)).toThrow('Validation failed');
  });
});
