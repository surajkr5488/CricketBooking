import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function getPitches(_req: Request, res: Response, next: NextFunction) {
  try {
    const pitches = await prisma.pitch.findMany({ orderBy: { name: 'asc' } });
    res.json({ pitches });
  } catch (err) { next(err); }
}
