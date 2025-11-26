import { Router, Request, Response, NextFunction } from 'express';
import { roomService } from '../services';
import { validateQuery, validateParams, validateBody, authenticate } from '../middleware';
import {
  searchRoomsQuerySchema,
  getRoomParamsSchema,
  checkAvailabilityQuerySchema,
  createRoomSchema,
  SearchRoomsQuery,
  GetRoomParams,
  CheckAvailabilityQuery,
  CreateRoomInput
} from '../utils/validationSchemas';

const router = Router();

/**
 * POST /api/rooms
 * Create a new room
 * Access: Authenticated users only
 */
router.post(
  '/',
  authenticate,
  validateBody(createRoomSchema),
  async (req: Request<{}, {}, CreateRoomInput>, res: Response, next: NextFunction) => {
    try {
      const roomData = req.body;
      const room = await roomService.createRoom(roomData);

      res.status(201).json({
        success: true,
        data: { room }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rooms/search
 * Search rooms with filters and pagination
 * Access: Public
 *
 * Note: This is the primary endpoint for listing rooms.
 * Use filters to narrow results, pagination for large datasets.
 */
router.get(
  '/search',
  validateQuery(searchRoomsQuerySchema),
  async (req: Request<{}, {}, {}, SearchRoomsQuery>, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const result = await roomService.searchRooms(filters);

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
  authenticate,
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
