import { Router, Request, Response, NextFunction } from 'express';
import { bookingService } from '../services';
import { authenticate, validateBody } from '../middleware';
import { bookingLimiter } from '../middleware';
import {
  createBookingSchema,
  CreateBookingInput
} from '../utils/validationSchemas';

const router = Router();

/**
 * POST /api/bookings
 * Create a new booking
 * Access: Authenticated users only
 */
router.post(
  '/',
  authenticate,
  bookingLimiter,
  validateBody(createBookingSchema),
  async (req: Request<{}, {}, CreateBookingInput>, res: Response, next: NextFunction) => {
    try {
      const { roomId, startDate, endDate } = req.body;
      const userId = req.user!.userId;

      // Convert ISO string dates to Date objects
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const booking = await bookingService.createBooking(userId, roomId, startDateObj, endDateObj);

      res.status(201).json({
        success: true,
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
