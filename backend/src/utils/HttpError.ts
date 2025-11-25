/**
 * HTTP Error Class
 *
 * Custom error class for HTTP errors with proper type safety.
 * Extends the built-in Error class with status code support.
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly isOperational: boolean;

  constructor(message: string, status: number, isOperational: boolean = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Common HTTP Error Factory Functions
 */
export class HttpErrors {
  static badRequest(message: string = 'Bad Request'): HttpError {
    return new HttpError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): HttpError {
    return new HttpError(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): HttpError {
    return new HttpError(message, 403);
  }

  static notFound(message: string = 'Not Found'): HttpError {
    return new HttpError(message, 404);
  }

  static conflict(message: string = 'Conflict'): HttpError {
    return new HttpError(message, 409);
  }

  static internalServerError(message: string = 'Internal Server Error'): HttpError {
    return new HttpError(message, 500, false);
  }
}
