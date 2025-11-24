import { Router, Request, Response, NextFunction } from 'express';
import { roomService } from '../services';
import { validateQuery, validateParams } from '../middleware';
import {
  getRoomsQuerySchema,
  searchRoomsQuerySchema,
  getRoomParamsSchema,
  checkAvailabilityQuerySchema,
  GetRoomsQuery,
  SearchRoomsQuery,
  GetRoomParams,
  CheckAvailabilityQuery
} from '../utils/validationSchemas';

const router = Router();

/**
 * GET /api/rooms
 * Get all rooms with optional pagination
 * Access: Public
 */
router.get(
  '/',
  validateQuery(getRoomsQuerySchema),
  async (req: Request<{}, {}, {}, GetRoomsQuery>, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;
      const rooms = await roomService.getAllRooms(limit, offset);

      res.status(200).json({
        success: true,
        data: { rooms }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rooms/search
 * Search rooms with filters
 * Access: Public
 */
router.get(
  '/search',
  validateQuery(searchRoomsQuerySchema),
  async (req: Request<{}, {}, {}, SearchRoomsQuery>, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const rooms = await roomService.searchRooms(filters);

      res.status(200).json({
        success: true,
        data: { rooms }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rooms/:id
 * Get single room by ID
 * Access: Public
 */
router.get(
  '/:id',
  validateParams(getRoomParamsSchema),
  async (req: Request<GetRoomParams>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);

      res.status(200).json({
        success: true,
        data: { room }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rooms/:id/availability
 * Check room availability for date range
 * Access: Public
 */
router.get(
  '/:id/availability',
  validateParams(getRoomParamsSchema),
  validateQuery(checkAvailabilityQuerySchema),
  async (
    req: Request<GetRoomParams, {}, {}, CheckAvailabilityQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const availability = await roomService.checkAvailability(id, startDate, endDate);

      res.status(200).json({
        success: true,
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
