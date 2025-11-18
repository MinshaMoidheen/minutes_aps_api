import { Request, Response } from 'express';
import ClientAttendee from '@/models/clientAttendee';
import logger from '@/lib/logger';

export const deleteClientAttendee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refAdmin = req.userId;

    const attendee = await ClientAttendee.findOneAndDelete({ _id: id, refAdmin });

    if (!attendee) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client attendee not found or access denied',
      });
    }

    res.status(200).json({
      code: 'Success',
      message: 'Client attendee deleted successfully',
    });
  } catch (error) {
    logger.error('Delete client attendee error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

