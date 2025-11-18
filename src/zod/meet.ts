import { z } from 'zod';

// Schedule validation schemas
export const createScheduleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    meetingTypeId: z.string().optional(),
    startDate: z.string().datetime('Please enter a valid start date'),
    endDate: z.string().datetime('Please enter a valid end date'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    clientId: z.string().optional(),
    attendeeIds: z.array(z.string()).optional(),
    agenda: z.string().max(500, 'Agenda must be less than 500 characters').optional(),
    meetingPoints: z.array(z.object({
      pointsDiscussed: z.string().max(2000).optional().default(''),
      planOfAction: z.string().max(2000).optional().default(''),
      accountability: z.string().max(200).optional().default(''),
    })).optional(),
    closureReport: z.string().max(5000, 'Closure report must be less than 5000 characters').optional(),
    otherAttendees: z.string().max(500, 'Other attendees must be less than 500 characters').optional(),
    organizer: z.string().min(1, 'Organizer is required').max(50, 'Organizer name must be less than 50 characters'),
    // status is determined server-side from dates
    meetingLink: z.string().max(200, 'Meeting link must be less than 200 characters').optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  }),
});

export const updateScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Schedule ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
    meetingTypeId: z.string().optional(),
    startDate: z.string().datetime('Please enter a valid start date').optional(),
    endDate: z.string().datetime('Please enter a valid end date').optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)').optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)').optional(),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    clientId: z.string().optional(),
    attendeeIds: z.array(z.string()).optional(),
    agenda: z.string().max(500).optional(),
    meetingPoints: z.array(z.object({
      pointsDiscussed: z.string().max(2000).optional(),
      planOfAction: z.string().max(2000).optional(),
      accountability: z.string().max(200).optional(),
    })).optional(),
    closureReport: z.string().max(5000).optional(),
    otherAttendees: z.string().max(500).optional(),
    organizer: z.string().min(1, 'Organizer is required').max(50, 'Organizer name must be less than 50 characters').optional(),
    status: z.enum(['incoming', 'ongoing', 'previous']).optional(),
    meetingLink: z.string().max(200, 'Meeting link must be less than 200 characters').optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Schedule ID is required'),
  }),
});

export const getSchedulesQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    status: z.enum(['incoming', 'ongoing', 'previous']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.string().regex(/^(true|false)$/, 'isActive must be true or false').optional(),
  }),
});

export const deleteScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Schedule ID is required'),
  }),
});

export const getScheduleStatisticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime('Please enter a valid start date').optional(),
    endDate: z.string().datetime('Please enter a valid end date').optional(),
  }),
});
