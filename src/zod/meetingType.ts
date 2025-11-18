import { z } from 'zod';

// Meeting Type validation schemas
export const createMeetingTypeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }),
});

export const updateMeetingTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Meeting Type ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getMeetingTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Meeting Type ID is required'),
  }),
});

export const getMeetingTypesQuerySchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    offset: z.string().regex(/^\d+$/, 'Offset must be a number').optional(),
    search: z.string().optional(),
    isActive: z.string().regex(/^(true|false)$/, 'isActive must be true or false').optional(),
  }),
});

export const deleteMeetingTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Meeting Type ID is required'),
  }),
});


