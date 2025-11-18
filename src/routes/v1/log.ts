import { Router } from 'express';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validateRequest from '@/middlewares/validationError';

import createLog from '@/controllers/v1/log/create_log';
import getAllLogs from '@/controllers/v1/log/get_all_logs';
import getLogById from '@/controllers/v1/log/get_log_by_id';
import updateLog from '@/controllers/v1/log/update_log';
import deleteLog from '@/controllers/v1/log/delete_log';
import getLogStatistics from '@/controllers/v1/log/get_log_statistics';

import { 
  createLogSchema, 
  updateLogSchema, 
  getLogsQuerySchema, 
  getLogStatisticsQuerySchema, 
  logIdParamSchema 
} from '@/zod/log';

const router = Router();

// All log routes require authentication
router.use(authenticate);

// Create log entry
router.post('/', validateRequest(createLogSchema), createLog);

// Get all logs with filtering and pagination
router.get('/', validateRequest(getLogsQuerySchema), getAllLogs);

// Get log statistics and analytics
router.get('/statistics', validateRequest(getLogStatisticsQuerySchema), getLogStatistics);

// Get log by ID
router.get('/:id', validateRequest(logIdParamSchema), getLogById);

// Update log entry
router.put('/:id', validateRequest(updateLogSchema), updateLog);

// Delete log entry
router.delete('/:id', validateRequest(logIdParamSchema), deleteLog);

export default router;
