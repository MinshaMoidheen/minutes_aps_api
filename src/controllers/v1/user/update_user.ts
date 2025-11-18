import logger from '@/lib/logger';
import User from '@/models/user';

import type { Request, Response } from 'express';

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params as { userId: string };
    const update = req.body as Record<string, unknown>;

    // Do not allow role escalation via this endpoint unless explicitly sent and permitted upstream
    // Password hashing is handled by model pre-save only on create; here we rely on separate logic if needed
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true, context: 'query' },
    )
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({ code: 'NotFound', message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User updated successfully', user });
    logger.info('User updated by admin', { userId });
  } catch (err) {
    res.status(500).json({ code: 'Server Error', message: 'Internal server error', error: err });
    logger.error('Error updating user by admin', err);
  }
};

export default updateUser;
