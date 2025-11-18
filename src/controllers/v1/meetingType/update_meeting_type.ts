import { Request, Response } from 'express';
import MeetingType from '@/models/meetingType';
import logger from '@/lib/logger';

export const updateMeetingType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    const refAdmin = req.userId;

    // Find meeting type
    const meetingType = await MeetingType.findOne({ _id: id, refAdmin });
    if (!meetingType) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Meeting type not found or access denied',
      });
    }

    // Check for duplicate title if title is being updated
    if (title && title !== meetingType.title) {
      const existingType = await MeetingType.findOne({ title, refAdmin }).lean().exec();
      if (existingType) {
        return res.status(409).json({
          code: 'ConflictError',
          message: 'Meeting type with this title already exists',
        });
      }
    }

    // Update fields
    if (title) meetingType.title = title;
    if (description !== undefined) meetingType.description = description;
    if (isActive !== undefined) meetingType.isActive = isActive;

    await meetingType.save();

    res.status(200).json({
      code: 'Success',
      message: 'Meeting type updated successfully',
      data: {
        id: meetingType._id,
        title: meetingType.title,
        description: meetingType.description,
        isActive: meetingType.isActive,
        createdAt: meetingType.createdAt,
        updatedAt: meetingType.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Update meeting type error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

