import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation Middleware Factory
 *
 * Creates middleware functions that validate request data (body, query, params)
 * against Zod schemas. Returns 400 on validation errors with formatted Zod error details.
 */

/**
 * Validate Request Body
 *
 * @param schema - Zod schema to validate request body against
 * @returns Express middleware function
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate request body
      const validated = schema.parse(req.body);

      // Replace req.body with validated data (with proper typing)
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.') || 'root',
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Request body validation failed',
            details: validationErrors,
          },
        });
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};

/**
 * Validate Query Parameters
 *
 * @param schema - Zod schema to validate query parameters against
 * @returns Express middleware function
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate query parameters
      const validated = schema.parse(req.query);

      // Replace req.query with validated data
      req.query = validated as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.') || 'root',
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Query parameters validation failed',
            details: validationErrors,
          },
        });
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};

/**
 * Validate Route Parameters
 *
 * @param schema - Zod schema to validate route parameters against
 * @returns Express middleware function
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate route parameters
      const validated = schema.parse(req.params);

      // Replace req.params with validated data
      req.params = validated as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.') || 'root',
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Route parameters validation failed',
            details: validationErrors,
          },
        });
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};

/**
 * Generic Validation Middleware
 * Validates multiple parts of the request (body, query, params) at once
 *
 * @param schemas - Object containing Zod schemas for body, query, and/or params
 * @returns Express middleware function
 */
export const validate = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query if schema provided
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }

      // Validate params if schema provided
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.') || 'root',
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Request validation failed',
            details: validationErrors,
          },
        });
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};
