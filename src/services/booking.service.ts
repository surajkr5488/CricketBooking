import { prisma } from '../config/prisma';
import { getRedis, RESERVATION_KEY } from '../config/redis';
import { createError } from '../middlewares/errorHandler';
import { getIO } from '../socket/socket';

const RESERVATION_TTL = parseInt(process.env.RESERVATION_TTL || '120', 10);

// ── Reserve slot (2-minute Redis hold) ───────────────────────────
export async function reserveSlot(
  userId: string,
  pitchId: string,
  slotId: string,
  date: string
) {
  const redis = getRedis();
  const key = RESERVATION_KEY(slotId, date);

  // Check not already in DB
  const booked = await prisma.booking.findFirst({
    where: { slotId, bookingDate: new Date(date), status: 'CONFIRMED' },
  });
  if (booked) throw createError('Slot is already booked', 409);

  // SET NX — atomic, idempotent
  const value = JSON.stringify({ userId, pitchId, slotId, date });
  const result = await redis.set(key, value, 'EX', RESERVATION_TTL, 'NX');

  if (result === null) {
    // Allow same user to re-reserve (e.g. app restart)
    const existing = await redis.get(key);
    if (existing && JSON.parse(existing).userId === userId) {
      const ttl = await redis.ttl(key);
      return { expiresAt: new Date(Date.now() + ttl * 1000).toISOString() };
    }
    throw createError('Slot is already reserved by another user', 409);
  }

  const expiresAt = new Date(Date.now() + RESERVATION_TTL * 1000).toISOString();

  // Broadcast to everyone watching this pitch+date
  getIO()
    .to(`pitch:${pitchId}:${date}`)
    .emit('slot_reserved', { slotId, expiresAt });

  return { expiresAt };
}

// ── Confirm booking (DB row lock prevents race conditions) ────────
export async function confirmBooking(
  userId: string,
  pitchId: string,
  slotId: string,
  date: string
) {
  const redis = getRedis();
  const key = RESERVATION_KEY(slotId, date);

  // Check reservation still alive
  const raw = await redis.get(key);
  if (!raw) throw createError('Reservation expired. Please select the slot again.', 410);

  const reservation = JSON.parse(raw);
  if (reservation.userId !== userId)
    throw createError('Reservation belongs to another user', 403);

  // ── DB transaction + row lock ─────────────────────────────────
  const booking = await prisma.$transaction(async tx => {
    // SELECT FOR UPDATE — second concurrent request waits here
    const conflict = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM bookings
      WHERE  slot_id      = ${slotId}
      AND    booking_date = ${new Date(date)}
      AND    status       = 'CONFIRMED'
      FOR UPDATE
    `;
    if (conflict.length > 0)
      throw createError('Slot was just booked by another user', 409);

    try {
      return await tx.booking.create({
        data: {
          userId,
          pitchId,
          slotId,
          bookingDate: new Date(date),
          status: 'CONFIRMED',
        },
        include: {
          pitch: {
            select: {
              name: true,
              location: true,
              pricePerHour: true,
            },
          },
        },
      });
    } catch (error: any) {
      // Prisma unique constraint error
      if (error.code === 'P2002') {
        throw createError('Slot already booked by another user', 409);
      }
      throw error;
    }
  });
  // ─────────────────────────────────────────────────────────────

  // Clean Redis hold
  await redis.del(key);

  // Broadcast permanently booked
  getIO()
    .to(`pitch:${pitchId}:${date}`)
    .emit('slot_booked', { slotId });

  return booking;
}

// ── My bookings ───────────────────────────────────────────────────
export async function getMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId, status: 'CONFIRMED' },
    include: { pitch: { select: { name: true, location: true, pricePerHour: true } } },
    orderBy: { bookingDate: 'desc' },
  });
}

// ── Cancel booking ────────────────────────────────────────────────
export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId, status: 'CONFIRMED' },
  });
  if (!booking) throw createError('Booking not found', 404);
  if (booking.bookingDate < new Date())
    throw createError('Cannot cancel a past booking', 400);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });

  const dateStr = booking.bookingDate.toISOString().split('T')[0];
  getIO()
    .to(`pitch:${booking.pitchId}:${dateStr}`)
    .emit('slot_released', { slotId: booking.slotId });

  return updated;
}
