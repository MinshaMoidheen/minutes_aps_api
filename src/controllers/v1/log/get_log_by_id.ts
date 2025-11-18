import logger from '@/lib/logger';

import Log from '@/models/log';
import User from '@/models/user';

import type { Request, Response } from 'express';

// Helper function to fetch user data and format like populate
const fetchUserData = async (userId: string) => {
  try {
    if (userId && userId !== 'anonymous' && userId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId, fetch from database
      const user = await User.findById(userId).select('username email role firstName lastName').lean().exec();
      if (user) {
        // Format the user data to match what populate would return
        const formattedUser = {
          _id: user._id,
          empCode: user.username || 'N/A',
          empName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'N/A',
          email: user.email,
          role: user.role,
        };
        return formattedUser;
      }
    } else if (userId === 'anonymous') {
      // Handle anonymous users
      return {
        _id: 'anonymous',
        empCode: 'N/A',
        empName: 'Anonymous User',
        email: 'N/A',
        role: 'anonymous',
      };
    }
    return null;
  } catch (error) {
    logger.warn('Could not fetch user data', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
};

const getLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = await Log.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    })
      .lean()
      .exec();

    if (!log) {
      res.status(404).json({
        code: 'Not Found',
        message: 'Log not found',
      });
      return;
    }

    // Populate user data from database
    if (log.userId) {
      const userData = await fetchUserData(log.userId);
      if (userData) {
        log.userId = userData as any;
      }
    }

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.error('Error while getting log by ID', error);
  }
};

export default getLogById;
