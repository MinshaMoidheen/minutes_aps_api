import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function cancelSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    // Note: Cancelled meetings are now treated as 'previous' status
    const schedule = await Meet.findByIdAndUpdate(id, { status: 'previous' }, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    return res.json({ success: true, message: 'Schedule cancelled', schedule });
  } catch (err) {
    next(err);
  }
}


