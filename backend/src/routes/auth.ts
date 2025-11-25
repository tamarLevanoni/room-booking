import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { validateBody } from '../middleware';
import { authLimiter } from '../middleware';
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput
} from '../utils/validationSchemas';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Access: Public
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const user = await authService.register(email, password, name);

      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login user and return tokens
 * Access: Public
 *
 * Security: Refresh token is stored in httpOnly cookie
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return only access token and user data (NOT refresh token)
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from httpOnly cookie
 * Access: Public
 */
router.post(
  '/refresh',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Refresh token not found',
          }
        });
        return;
      }

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user by clearing refresh token cookie
 * Access: Public
 */
router.post(
  '/logout',
  async (_req: Request, res: Response) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  }
);

export default router;
