import { Request, Response } from 'express';
import MeetingType from '@/models/meetingType';
import logger from '@/lib/logger';

export const getAllMeetingTypes = async (req: Request, res: Response) => {
  try {
    const {
      limit = '20',
      offset = '0',
      search = '',
      isActive = '',
    } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Build filter object
    const filter: any = { refAdmin: req.userId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const meetingTypes = await MeetingType.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offsetNum)
      .limit(limitNum)
      .lean()
      .exec();

    const total = await MeetingType.countDocuments(filter);

    res.status(200).json({
      code: 'Success',
      message: 'Meeting types retrieved successfully',
      data: {
        meetingTypes,
        total,
        limit: limitNum,
        offset: offsetNum,
      },
    });
  } catch (error) {
    logger.error('Get all meeting types error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

