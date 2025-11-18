import config from '@/config';
import logger from '@/lib/logger';
import User from '@/models/user';
import type { Request, Response } from 'express';

const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      role,
      isActive,
      isEmailVerified,
      company,
      designation,
      limit = config.defaultResLimit,
      offset = config.defaultResOffset,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build search query
    const query: any = {};

    // Text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { company: searchRegex },
        { designation: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Email verification filter
    if (isEmailVerified !== undefined) {
      query.isEmailVerified = isEmailVerified === 'true';
    }

    // Company filter
    if (company) {
      query.company = new RegExp(company as string, 'i');
    }

    // Designation filter
    if (designation) {
      query.designation = new RegExp(designation as string, 'i');
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Execute search query
    const users = await User.find(query)
      .select('-password -__v')
      .populate('refAdmin', 'username email role firstName lastName')
      .sort(sort)
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean()
      .exec();

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit as string));
    const currentPage = Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          totalPages,
          currentPage,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          role: role || null,
          isActive: isActive !== undefined ? isActive === 'true' : null,
          isEmailVerified: isEmailVerified !== undefined ? isEmailVerified === 'true' : null,
          company: company || null,
          designation: designation || null
        },
        sort: {
          sortBy,
          sortOrder
        }
      }
    });

  } catch (err) {
    logger.error('Error while searching users', err);
    res.status(500).json({
      success: false,
      code: 'ServerError',
      message: 'Internal server error while searching users',
      error: err
    });
  }
};

export default searchUsers;
