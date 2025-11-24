import { Request } from 'express';

/**
 * Extend Express Request interface to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

export {};
