import { Request, Response } from 'express';
import MeetingType from '@/models/meetingType';
import logger from '@/lib/logger';

export const createMeetingType = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const refAdmin = req.userId;

    // Check if meeting type with title already exists for this admin
    const existingType = await MeetingType.findOne({ title, refAdmin }).lean().exec();
    if (existingType) {
      return res.status(409).json({
        code: 'ConflictError',
        message: 'Meeting type with this title already exists',
      });
    }

    const meetingType = await MeetingType.create({
      title,
      description,
      refAdmin,
    });

    res.status(201).json({
      code: 'Success',
      message: 'Meeting type created successfully',
      data: {
        id: meetingType._id,
        title: meetingType.title,
        description: meetingType.description,
        isActive: meetingType.isActive,
        createdAt: meetingType.createdAt,
      },
    });
  } catch (error) {
    logger.error('Create meeting type error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

