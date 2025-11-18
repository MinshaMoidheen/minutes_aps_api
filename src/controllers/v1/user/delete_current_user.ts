import logger from '@/lib/logger';

import User from '@/models/user';

import type { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  try {
    // Get user data before deletion for logging
    const user = await User.findById(userId).select('username email role').lean().exec();
    
    if (!user) {
      res.status(404).json({
        code: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    await User.deleteOne({ _id: userId });

    // Log user deletion
    await logger.log(
      user as any,
      'DELETE',
      'USER',
      `User account deleted: ${user.email}`,
      user._id.toString(),
      [
        { field: 'username', oldValue: user.username, newValue: 'DELETED' },
        { field: 'email', oldValue: user.email, newValue: 'DELETED' },
        { field: 'role', oldValue: user.role, newValue: 'DELETED' },
        { field: 'deletedAt', oldValue: null, newValue: new Date() },
      ]
    );

    logger.info('User deleted successfully', { userId });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });
    logger.error('Error while deleting current user', err);
  }
};

export default deleteCurrentUser;
