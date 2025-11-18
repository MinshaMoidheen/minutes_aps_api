import logger from '@/lib/logger';
import config from '@/config';

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

// Helper function to populate user data in logs
const populateUserData = async (logs: any[]) => {
  if (!Array.isArray(logs)) {
    logs = [logs];
  }

  for (let log of logs) {
    if (log.userId) {
      const userData = await fetchUserData(log.userId);
      if (userData) {
        log.userId = userData;
      }
    }
  }

  return Array.isArray(logs) ? logs : logs[0];
};

const getAllLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      action,
      module,
      userRole,
      userId,
      fromDate,
      toDate,
      search,
      companyId,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const companyIdToUse = companyId || req.user?.companyId;

    // Build query
    const query: any = { companyId: companyIdToUse };

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by module
    if (module) {
      query.module = module;
    }

    // Filter by user role
    if (userRole) {
      query.userRole = userRole;
    }

    // Filter by user ID
    if (userId) {
      query.userId = userId;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate as string);
      }
    }

    // Text search across description and changes
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'changes.field': { $regex: search, $options: 'i' } },
        { 'changes.oldValue': { $regex: search, $options: 'i' } },
        { 'changes.newValue': { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const logs = await Log.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .exec();

    // Populate user data from database
    const populatedLogs = await populateUserData(logs);

    // Get total count for pagination
    const totalLogs = await Log.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / Number(limit));

    res.status(200).json({
      logs: populatedLogs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalLogs,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
      filters: {
        action,
        module,
        userRole,
        userId,
        fromDate,
        toDate,
        search,
        companyId: companyIdToUse,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.error('Error while getting all logs', error);
  }
};

export default getAllLogs;
