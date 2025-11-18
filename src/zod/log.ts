import { z } from 'zod';

// Create log entry validation
export const createLogSchema = z.object({
  body: z.object({
    action: z.string().min(1, 'Action is required').max(50, 'Action must be less than 50 characters'),
    module: z.string().min(1, 'Module is required').max(50, 'Module must be less than 50 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
    userRole: z.string().min(1, 'User role is required').max(50, 'User role must be less than 50 characters'),
    userId: z.string().min(1, 'User ID is required'),
    documentId: z.string().optional(),
    companyId: z.string().optional(),
    changes: z.array(z.object({
      field: z.string().min(1, 'Field is required'),
      oldValue: z.any().optional(),
      newValue: z.any(),
    })).optional(),
  }),
});

// Update log entry validation
export const updateLogSchema = z.object({
  body: z.object({
    action: z.string().min(1, 'Action is required').max(50, 'Action must be less than 50 characters').optional(),
    module: z.string().min(1, 'Module is required').max(50, 'Module must be less than 50 characters').optional(),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
    userRole: z.string().min(1, 'User role is required').max(50, 'User role must be less than 50 characters').optional(),
    userId: z.string().min(1, 'User ID is required').optional(),
    documentId: z.string().optional(),
    changes: z.array(z.object({
      field: z.string().min(1, 'Field is required'),
      oldValue: z.any().optional(),
      newValue: z.any(),
    })).optional(),
  }),
});

// Get logs query validation
export const getLogsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    action: z.string().optional(),
    module: z.string().optional(),
    userRole: z.string().optional(),
    userId: z.string().optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    search: z.string().optional(),
    companyId: z.string().optional(),
  }),
});

// Get log statistics query validation
export const getLogStatisticsQuerySchema = z.object({
  query: z.object({
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    companyId: z.string().optional(),
  }),
});

// Log ID parameter validation
export const logIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Log ID is required'),
  }),
});
