import { Request, Response, NextFunction } from 'express';
import Meet from '@/models/meet';

export default async function getScheduleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Get schedule with lean to preserve original IDs
    const scheduleRaw = await Meet.findById(id).lean();
      
    if (!scheduleRaw) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    // Manually populate referenced documents while preserving original IDs
    const schedule: any = { ...scheduleRaw };

    // Populate meetingTypeId
    if (scheduleRaw.meetingTypeId) {
      try {
        const MeetingType = (await import('@/models/meetingType')).default;
        const meetingType = await MeetingType.findById(scheduleRaw.meetingTypeId)
          .select('title description')
          .lean();
        schedule.meetingTypeId = meetingType || scheduleRaw.meetingTypeId;
      } catch (err) {
        // Keep original ID if populate fails
        schedule.meetingTypeId = scheduleRaw.meetingTypeId;
      }
    }

    // Populate clientId - replace with populated object if found, otherwise keep original ID
    if (scheduleRaw.clientId) {
      const originalClientId = scheduleRaw.clientId;
      // Convert to string for consistent handling
      const clientIdStr = originalClientId.toString();
      
      try {
        const Client = (await import('@/models/client')).default;
        const client = await Client.findById(clientIdStr)
          .select('username email')
          .lean();
        if (client) {
          // Replace clientId with populated object, ensuring _id is preserved
          schedule.clientId = {
            ...client,
            _id: clientIdStr, // Ensure _id matches original
          };
          // Also add as 'client' for frontend compatibility
          schedule.client = schedule.clientId;
        } else {
          // If client not found, keep original ID as string
          schedule.clientId = clientIdStr;
        }
      } catch (err) {
        // If populate fails, keep original ID as string
        schedule.clientId = clientIdStr;
      }
    }

    // Populate attendeeIds - replace with populated objects if found, otherwise keep original IDs
    if (scheduleRaw.attendeeIds && Array.isArray(scheduleRaw.attendeeIds) && scheduleRaw.attendeeIds.length > 0) {
      try {
        const ClientAttendee = (await import('@/models/clientAttendee')).default;
        // Extract IDs from array (handle both string IDs and object IDs)
        const attendeeIds = scheduleRaw.attendeeIds.map((id: any) => {
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
        schedule.attendeeIds = attendeeIds.map((id: any) => {
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
        schedule.attendeeIds = scheduleRaw.attendeeIds.map((id: any) => {
          if (typeof id === 'object' && id._id) {
            return id._id.toString();
          }
          return id.toString();
        });
      }
    } else {
      // Ensure attendeeIds is an array even if empty
      schedule.attendeeIds = scheduleRaw.attendeeIds || [];
    }
    
    return res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
}

