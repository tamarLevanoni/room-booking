import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

/**
 * Authentication Middleware
 *
 * Extracts JWT token from Authorization header (Bearer token),
 * verifies it using authService.verifyAccessToken(),
 * and attaches userId to req.user.
 *
 * Returns 401 if token is invalid, expired, or missing.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: { message: 'Authorization header required' },
      });
      return;
    }

    // Check Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid authorization header format. Expected: Bearer <token>' },
      });
      return;
    }

    const token = parts[1];

    // Ensure token exists (shouldn't be undefined after length check, but TypeScript needs certainty)
    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Token missing in authorization header' },
      });
      return;
    }

    // Verify token using authService
    const decoded = authService.verifyAccessToken(token);

    // Attach userId to request object
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error: any) {
    // Handle JWT verification errors
    res.status(401).json({
      success: false,
      error: { message: error.message || 'Invalid or expired token' },
    });
  }
};
