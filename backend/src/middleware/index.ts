/**
 * Middleware Module Exports
 *
 * Central export point for all middleware functions.
 * Import from this file to use any middleware in the application.
 */

// Authentication middleware
export { authenticate } from './auth';

// Error handling middleware
export { errorHandler, notFoundHandler } from './errorHandler';

// Rate limiting middleware
export {
  generalApiLimiter,
  authLimiter,
  bookingLimiter,
  strictLimiter,
} from './rateLimiter';

// Validation middleware
export {
  validateBody,
  validateQuery,
  validateParams,
  validate,
} from './validation';
