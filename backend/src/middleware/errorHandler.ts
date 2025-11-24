import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom Error Interface
 * Extends Error with optional status code
 */
interface AppError extends Error {
  status?: number;
}

/**
 * Global Error Handler Middleware
 *
 * Handles all errors thrown in the application:
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
  err: AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error to console
  console.error('Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

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

  // Handle errors with status codes
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  // Determine error type based on status code
  let errorType = 'Internal Server Error';

  switch (statusCode) {
    case 400:
      errorType = 'Bad Request';
      break;
    case 401:
      errorType = 'Unauthorized';
      break;
    case 403:
      errorType = 'Forbidden';
      break;
    case 404:
      errorType = 'Not Found';
      break;
    case 409:
      errorType = 'Conflict';
      break;
    case 422:
      errorType = 'Unprocessable Entity';
      break;
    case 429:
      errorType = 'Too Many Requests';
      break;
    case 500:
    default:
      errorType = 'Internal Server Error';
      break;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      type: errorType,
    },
  });
};

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
