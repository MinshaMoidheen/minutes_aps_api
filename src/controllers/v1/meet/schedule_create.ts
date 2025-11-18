import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      title,
      meetingTypeId,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      clientId,
      attendeeIds,
      agenda,
      meetingPoints,
      closureReport,
      otherAttendees,
      organizer,
      meetingLink,
      notes,
    } = req.body;

    // Determine status from start/end dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize end to end-of-day for inclusive comparison
    const endInclusive = new Date(end);
    endInclusive.setHours(23, 59, 59, 999);

    let computedStatus: 'incoming' | 'ongoing' | 'previous' = 'incoming';
    if (now < start) {
      computedStatus = 'incoming';
    } else if (now >= start && now <= endInclusive) {
      computedStatus = 'ongoing';
    } else {
      computedStatus = 'previous';
    }

    const schedule = await Meet.create({
      title,
      meetingTypeId,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      clientId,
      attendeeIds,
      agenda,
      meetingPoints,
      closureReport,
      otherAttendees,
      organizer,
      status: computedStatus,
      refAdmin: (req as any).user?._id,
      meetingLink,
      notes,
    });

    return res.status(201).json({ success: true, message: 'Schedule created', schedule });
  } catch (err) {
    next(err);
  }
}


