import { Request, Response, NextFunction } from 'express';
import { getSlotsForPitchAndDate } from '../services/slot.service';

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { pitchId, date } = req.query as { pitchId: string; date: string };

    if (!pitchId || !date) {
      res.status(400).json({ error: 'pitchId and date query params are required' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'date must be YYYY-MM-DD format' });
      return;
    }

    const slots = await getSlotsForPitchAndDate(pitchId, date);
    res.json({ pitchId, date, slots });
  } catch (err) { next(err); }
}
