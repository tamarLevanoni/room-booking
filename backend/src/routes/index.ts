import { Router } from 'express';
import authRoutes from './auth';
import roomRoutes from './rooms';
import bookingRoutes from './bookings';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);

export default router;
