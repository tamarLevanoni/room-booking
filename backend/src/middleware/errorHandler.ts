import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/HttpError';

/**
 * Global Error Handler Middleware
 *
 * Handles all errors thrown in the application:
 * - HttpError (custom errors with status codes)
 * - Validation errors (Zod)
 * - Authentication errors (401)
 * - Not found errors (404)
 * - Conflict errors (409)
 * - Generic server errors (500)
 *
 * Formats all errors as: { success: false, error: { message } }
 * Logs errors to console using console.error
 */
export const errorHandler = (
  err: Error | HttpError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error to console (only operational errors in production)
  const isOperational = err instanceof HttpError ? err.isOperational : false;

  if (process.env.NODE_ENV !== 'production' || !isOperational) {
    console.error('Error occurred:', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: validationErrors,
      },
    });
    return;
  }

  // Handle HttpError instances
  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: false,
      error: {
        message: err.message,
        type: getErrorType(err.status),
      },
    });
    return;
  }

  // Handle generic errors with status codes (backward compatibility)
  const statusCode = (err as any).statusCode || (err as any).status || 500;
  const message = err.message || 'Internal server error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      type: getErrorType(statusCode),
    },
  });
};

/**
 * Helper function to get error type from status code
 */
function getErrorType(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
    default:
      return 'Internal Server Error';
  }
}

/**
 * 404 Not Found Handler
 * Middleware to handle requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      type: 'Not Found',
    },
  });
};
