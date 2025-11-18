import { Request, Response } from 'express';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
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
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const clients = await Client.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
      .exec();

    const total = await Client.countDocuments(filter);

    res.status(200).json({
      code: 'Success',
      message: 'Clients retrieved successfully',
      data: {
        clients,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Get all clients error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
