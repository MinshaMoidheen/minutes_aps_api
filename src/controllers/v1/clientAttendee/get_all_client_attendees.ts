import { Request, Response } from 'express';
import ClientAttendee from '@/models/clientAttendee';
import logger from '@/lib/logger';

export const getAllClientAttendees = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      clientId = '',
      isActive = '',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { refAdmin: req.userId };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const attendees = await ClientAttendee.find(filter)
      .populate('clientId', 'username email company')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
      .exec();

    const total = await ClientAttendee.countDocuments(filter);

    res.status(200).json({
      code: 'Success',
      message: 'Client attendees retrieved successfully',
      data: {
        attendees,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Get all client attendees error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
