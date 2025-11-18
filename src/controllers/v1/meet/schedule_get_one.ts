import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function getScheduleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const schedule = await Meet.findById(id)
      .populate('meetingTypeId', 'title description')
      .populate('clientId', 'username email')
      .populate('attendeeIds', 'username email')
      .exec();
      
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    return res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
}

