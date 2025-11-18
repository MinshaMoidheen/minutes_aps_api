import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const update = req.body as any;

    // If dates are being updated, recompute status from dates
    if (update.startDate || update.endDate) {
      // Fetch existing doc to get missing date
      const existing = await Meet.findById(id).select('startDate endDate').lean();
      if (existing) {
        const start = new Date(update.startDate || existing.startDate);
        const end = new Date(update.endDate || existing.endDate);
        const endInclusive = new Date(end);
        endInclusive.setHours(23, 59, 59, 999);
        const now = new Date();
        update.status = now < start ? 'incoming' : now <= endInclusive ? 'ongoing' : 'previous';
      }
    }
    const schedule = await Meet.findByIdAndUpdate(id, update, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    return res.json({ success: true, message: 'Schedule updated', schedule });
  } catch (err) {
    next(err);
  }
}


