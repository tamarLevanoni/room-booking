import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter Configuration
 *
 * Uses express-rate-limit to prevent abuse and DDoS attacks.
 * Different limits are applied based on endpoint sensitivity.
 */

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP address
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      type: 'Too Many Requests',
    },
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again after 15 minutes',
        type: 'Too Many Requests',
      },
    });
  },
});

/**
 * Auth Endpoints Rate Limiter
 * 10 requests per 15 minutes per IP address
 * Applied to login, register, and refresh token endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes',
      type: 'Too Many Requests',
    },
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again after 15 minutes',
        type: 'Too Many Requests',
      },
    });
  },
  // Skip successful requests from count (optional - can be enabled for better UX)
  skipSuccessfulRequests: false,
});

/**
 * Booking Endpoints Rate Limiter
 * 20 requests per 15 minutes per IP address
 * Applied to booking creation endpoint
 */
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many booking requests, please try again after 15 minutes',
      type: 'Too Many Requests',
    },
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many booking requests, please try again after 15 minutes',
        type: 'Too Many Requests',
      },
    });
  },
});

/**
 * Strict Rate Limiter for Sensitive Operations
 * 5 requests per 15 minutes per IP address
 * Can be used for password reset, account deletion, etc.
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests for this sensitive operation, please try again after 15 minutes',
      type: 'Too Many Requests',
    },
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests for this sensitive operation, please try again after 15 minutes',
        type: 'Too Many Requests',
      },
    });
  },
});
