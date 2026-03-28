import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authenticate';
import * as bookingService from '../services/booking.service';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const reserveSchema = z.object({
  pitchId: z.string().min(1),
  slotId:  z.string().min(1),
  date:    z.string().regex(dateRegex, 'date must be YYYY-MM-DD'),
});

const confirmSchema = z.object({
  pitchId: z.string().min(1),
  slotId:  z.string().min(1),
  date:    z.string().regex(dateRegex, 'date must be YYYY-MM-DD'),
});

export async function reserveSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { pitchId, slotId, date } = reserveSchema.parse(req.body);
    const result = await bookingService.reserveSlot(req.userId!, pitchId, slotId, date);
    res.json({ message: 'Slot reserved for 2 minutes', ...result });
  } catch (err) { next(err); }
}

export async function confirmBooking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { pitchId, slotId, date } = confirmSchema.parse(req.body);
    const booking = await bookingService.confirmBooking(req.userId!, pitchId, slotId, date);
    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (err) { next(err); }
}

export async function getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bookings = await bookingService.getMyBookings(req.userId!);
    res.json({ bookings });
  } catch (err) { next(err); }
}

export async function cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { bookingId } = req.params;
    const result = await bookingService.cancelBooking(req.userId!, bookingId);
    res.json({ message: 'Booking cancelled', booking: result });
  } catch (err) { next(err); }
}
