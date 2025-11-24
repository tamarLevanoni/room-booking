import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { validateBody } from '../middleware';
import { authLimiter } from '../middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput
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
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Access: Public
 */
router.post(
  '/refresh',
  authLimiter,
  validateBody(refreshTokenSchema),
  async (req: Request<{}, {}, RefreshTokenInput>, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
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

export default router;
