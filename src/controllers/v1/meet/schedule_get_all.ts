import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function getAllSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      search = '', 
      status, 
      startDate, 
      endDate,
      clientId,
      isActive 
    } = req.query;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    // Client filter
    if (clientId) {
      filter.clientId = clientId;
    }

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const schedules = await Meet.find(filter)
      .populate('meetingTypeId', 'title description')
      .populate('clientId', 'username email')
      .populate('attendeeIds', 'username email')
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 });

    const total = await Meet.countDocuments(filter);

    return res.json({
      success: true,
      schedules,
      total,
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
}

