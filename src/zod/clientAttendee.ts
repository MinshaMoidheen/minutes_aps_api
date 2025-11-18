import { z } from 'zod';

// ClientAttendee validation schemas
export const createClientAttendeeSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address').max(100, 'Email must be less than 100 characters'),
    phoneNumber: z.string().min(1, 'Phone number is required').max(15, 'Phone number must be less than 15 characters'),
    clientId: z.string().min(1, 'Client ID is required'),
    designation: z.string().max(50, 'Designation must be less than 50 characters').optional(),
    department: z.string().max(50, 'Department must be less than 50 characters').optional(),
  }),
});

export const updateClientAttendeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendee ID is required'),
  }),
  body: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters').optional(),
    email: z.string().email('Please enter a valid email address').max(100, 'Email must be less than 100 characters').optional(),
    phoneNumber: z.string().min(1, 'Phone number is required').max(15, 'Phone number must be less than 15 characters').optional(),
    clientId: z.string().min(1, 'Client ID is required').optional(),
    designation: z.string().max(50, 'Designation must be less than 50 characters').optional(),
    department: z.string().max(50, 'Department must be less than 50 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getClientAttendeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendee ID is required'),
  }),
});

export const getClientAttendeesQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    clientId: z.string().min(1, 'Client ID is required').optional(),
    isActive: z.string().regex(/^(true|false)$/, 'isActive must be true or false').optional(),
  }),
});

export const deleteClientAttendeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendee ID is required'),
  }),
});
