import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const schedule = await Meet.findByIdAndDelete(id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    return res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
}


