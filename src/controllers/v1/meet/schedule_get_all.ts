import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function getAllSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      search = '', 
      status, 
      startDate, 
      endDate,
      clientId,
      isActive 
    } = req.query;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    // Client filter
    if (clientId) {
      filter.clientId = clientId;
    }

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Get schedules with lean to preserve original IDs
    const schedulesRaw = await Meet.find(filter)
      .lean()
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 });

    // Manually populate referenced documents while preserving original IDs
    const schedules = await Promise.all(
      schedulesRaw.map(async (schedule: any) => {
        const populatedSchedule = { ...schedule };

        // Populate meetingTypeId
        if (schedule.meetingTypeId) {
          try {
            const MeetingType = (await import('@/models/meetingType')).default;
            const meetingType = await MeetingType.findById(schedule.meetingTypeId)
              .select('title description')
              .lean();
            populatedSchedule.meetingTypeId = meetingType || schedule.meetingTypeId;
          } catch (err) {
            // Keep original ID if populate fails
            populatedSchedule.meetingTypeId = schedule.meetingTypeId;
          }
        }

        // Populate clientId - replace with populated object if found, otherwise keep original ID
        if (schedule.clientId) {
          const originalClientId = schedule.clientId;
          // Convert to string for consistent handling
          const clientIdStr = originalClientId.toString();
          
          try {
            const Client = (await import('@/models/client')).default;
            const client = await Client.findById(clientIdStr)
              .select('username email')
              .lean();
            if (client) {
              // Replace clientId with populated object, ensuring _id is preserved
              populatedSchedule.clientId = {
                ...client,
                _id: clientIdStr, // Ensure _id matches original
              };
              // Also add as 'client' for frontend compatibility
              populatedSchedule.client = populatedSchedule.clientId;
            } else {
              // If client not found, keep original ID as string
              populatedSchedule.clientId = clientIdStr;
            }
          } catch (err) {
            // If populate fails, keep original ID as string
            populatedSchedule.clientId = clientIdStr;
          }
        }

        // Populate attendeeIds - replace with populated objects if found, otherwise keep original IDs
        if (schedule.attendeeIds && Array.isArray(schedule.attendeeIds) && schedule.attendeeIds.length > 0) {
          try {
            const ClientAttendee = (await import('@/models/clientAttendee')).default;
            // Extract IDs from array (handle both string IDs and object IDs)
            const attendeeIds = schedule.attendeeIds.map((id: any) => {
              if (typeof id === 'object' && id._id) {
                return id._id.toString();
              }
              return id.toString();
            });
            
            // Fetch all attendees in one query - Mongoose handles string/ObjectId conversion
            const attendees = await ClientAttendee.find({ _id: { $in: attendeeIds } })
              .select('username email phoneNumber designation department')
              .lean();
            
            // Create a map for quick lookup
            const attendeeMap = new Map(attendees.map((att: any) => [att._id.toString(), att]));
            
            // Replace IDs with populated objects where available, preserve original IDs otherwise
            populatedSchedule.attendeeIds = attendeeIds.map((id: any) => {
              const idStr = id.toString();
              const attendee = attendeeMap.get(idStr);
              if (attendee) {
                // Return populated object with _id preserved
                return {
                  ...attendee,
                  _id: idStr, // Ensure _id matches original
                };
              }
              // If attendee not found, return original ID as string
              return idStr;
            });
          } catch (err) {
            // If populate fails, keep original IDs as strings
            populatedSchedule.attendeeIds = schedule.attendeeIds.map((id: any) => {
              if (typeof id === 'object' && id._id) {
                return id._id.toString();
              }
              return id.toString();
            });
          }
        } else {
          // Ensure attendeeIds is an array even if empty
          populatedSchedule.attendeeIds = schedule.attendeeIds || [];
        }

        return populatedSchedule;
      })
    );

    const total = await Meet.countDocuments(filter);

    return res.json({
      success: true,
      schedules,
      total,
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
}

