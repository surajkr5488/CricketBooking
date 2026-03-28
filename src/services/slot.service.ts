import { prisma } from '../config/prisma';
import { getRedis, RESERVATION_KEY } from '../config/redis';

const OPEN_HOUR  = 6;   // 6 AM
const CLOSE_HOUR = 22;  // 10 PM

export interface SlotInfo {
  id:        string;          // pitchId_date_HH
  pitchId:   string;
  startTime: string;          // "06:00"
  endTime:   string;          // "07:00"
  status:    'available' | 'reserved' | 'booked';
  expiresAt?: string;
}

export function buildSlotId(pitchId: string, date: string, hour: number): string {
  return `${pitchId}_${date}_${String(hour).padStart(2, '0')}`;
}

function pad(h: number) { return `${String(h).padStart(2, '0')}:00`; }

export async function getSlotsForPitchAndDate(
  pitchId: string,
  date:    string
): Promise<SlotInfo[]> {
  const redis = getRedis();

  // All confirmed bookings for this pitch + date
  const bookings = await prisma.booking.findMany({
    where:  { pitchId, bookingDate: new Date(date), status: 'CONFIRMED' },
    select: { slotId: true },
  });
  const bookedIds = new Set(bookings.map(b => b.slotId));

  const slots: SlotInfo[] = [];

  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const id        = buildSlotId(pitchId, date, h);
    const startTime = pad(h);
    const endTime   = pad(h + 1);

    if (bookedIds.has(id)) {
      slots.push({ id, pitchId, startTime, endTime, status: 'booked' });
      continue;
    }

    const raw = await redis.get(RESERVATION_KEY(id, date));
    if (raw) {
      const ttl       = await redis.ttl(RESERVATION_KEY(id, date));
      const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
      slots.push({ id, pitchId, startTime, endTime, status: 'reserved', expiresAt });
      continue;
    }

    slots.push({ id, pitchId, startTime, endTime, status: 'available' });
  }

  return slots;
}
