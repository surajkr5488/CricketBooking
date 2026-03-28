import { Router } from 'express';
import {
  reserveSlot,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/reserve-slot',             authenticate, reserveSlot);
router.post('/confirm-booking',          authenticate, confirmBooking);
router.get('/my-bookings',               authenticate, getMyBookings);
router.patch('/bookings/:bookingId/cancel', authenticate, cancelBooking);

export default router;
