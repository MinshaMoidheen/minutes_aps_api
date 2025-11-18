import logger from '@/lib/logger';
import User from '@/models/user';

import type { Request, Response } from 'express';

const getAllAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;

    // Get all users with admin role
    const admins = await User.find({ role: 'admin' })
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

      console.log("admins",admins)

    // Get total count of admin users
    const total = await User.countDocuments({ role: 'admin' }).exec();

    res.status(200).json({
      message: 'Admins retrieved successfully',
      users: admins,
      total,
      limit,
      offset,
    });

    logger.info('Admins retrieved successfully', {
      total,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: err,
    });
    logger.error('Error retrieving admins', err);
  }
};

export default getAllAdmin;

