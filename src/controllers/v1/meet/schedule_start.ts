import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function startSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const schedule = await Meet.findByIdAndUpdate(id, { status: 'ongoing' }, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    return res.json({ success: true, message: 'Schedule started', schedule });
  } catch (err) {
    next(err);
  }
}


