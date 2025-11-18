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

const getLogStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromDate, toDate, companyId } = req.query;
    const companyIdToUse = companyId || req.user?.companyId;

    const query: any = { companyId: companyIdToUse };
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate as string);
      }
    }

    // Get basic counts
    const totalLogs = await Log.countDocuments(query);
    const todayLogs = await Log.countDocuments({
      ...query,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Get action distribution
    const actionStats = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get module distribution
    const moduleStats = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get user role distribution
    const userRoleStats = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$userRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get daily log count for the last 30 days
    const dailyStats = await Log.aggregate([
      { $match: query },
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top users by log count
    const topUsers = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Populate user details for top users
    const topUsersWithDetails = [];
    for (const user of topUsers) {
      const userData = await fetchUserData(user._id);
      topUsersWithDetails.push({
        _id: userData || user._id,
        count: user.count,
      });
    }

    res.status(200).json({
      summary: {
        totalLogs,
        todayLogs,
        dateRange: { fromDate, toDate },
      },
      distributions: {
        actions: actionStats,
        modules: moduleStats,
        userRoles: userRoleStats,
      },
      trends: {
        daily: dailyStats,
      },
      topUsers: topUsersWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.error('Error while getting log statistics', error);
  }
};

export default getLogStatistics;
