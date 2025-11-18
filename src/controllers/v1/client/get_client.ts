import { Request, Response } from 'express';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({ _id: id, refAdmin: req.userId })
      .select('-__v')
      .lean()
      .exec();

    if (!client) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client not found',
      });
    }

    res.status(200).json({
      code: 'Success',
      message: 'Client retrieved successfully',
      data: client,
    });
  } catch (error) {
    logger.error('Get client error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
