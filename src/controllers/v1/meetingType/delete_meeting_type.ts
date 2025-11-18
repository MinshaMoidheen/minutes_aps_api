import { Request, Response } from 'express';
import MeetingType from '@/models/meetingType';
import logger from '@/lib/logger';

export const deleteMeetingType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refAdmin = req.userId;

    const meetingType = await MeetingType.findOneAndDelete({ _id: id, refAdmin });

    if (!meetingType) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Meeting type not found or access denied',
      });
    }

    res.status(200).json({
      code: 'Success',
      message: 'Meeting type deleted successfully',
    });
  } catch (error) {
    logger.error('Delete meeting type error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

