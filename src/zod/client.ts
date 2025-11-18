import { z } from 'zod';

// Client validation schemas
export const createClientSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address').max(100, 'Email must be less than 100 characters'),
    phoneNumber: z.string().min(1, 'Phone number is required').max(15, 'Phone number must be less than 15 characters'),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Client ID is required'),
  }),
  body: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters').optional(),
    email: z.string().email('Please enter a valid email address').max(100, 'Email must be less than 100 characters').optional(),
    phoneNumber: z.string().min(1, 'Phone number is required').max(15, 'Phone number must be less than 15 characters').optional(),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    address: z.string().max(200, 'Address must be less than 200 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getClientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Client ID is required'),
  }),
});

export const getClientsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    isActive: z.string().regex(/^(true|false)$/, 'isActive must be true or false').optional(),
  }),
});

export const deleteClientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Client ID is required'),
  }),
});
