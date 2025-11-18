import { Router } from 'express';
import authenticate from '@/middlewares/authenticate';
import { requireAdmin } from '@/middlewares/roleBasedAccess';
import validateRequest from '@/middlewares/validationError';
import {
  createScheduleSchema,
  updateScheduleSchema,
  getScheduleSchema,
  getSchedulesQuerySchema,
  deleteScheduleSchema,
} from '@/zod/meet';
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  startSchedule,
  completeSchedule,
  cancelSchedule,
} from '@/controllers/v1/meet';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post('/', validateRequest(createScheduleSchema), createSchedule);
router.get('/', validateRequest(getSchedulesQuerySchema), getAllSchedules);
router.get('/:id', validateRequest(getScheduleSchema), getScheduleById);
router.put('/:id', validateRequest(updateScheduleSchema), updateSchedule);
router.delete('/:id', validateRequest(deleteScheduleSchema), deleteSchedule);

router.post('/:id/start', validateRequest(getScheduleSchema), startSchedule);
router.post('/:id/complete', validateRequest(getScheduleSchema), completeSchedule);
router.post('/:id/cancel', validateRequest(getScheduleSchema), cancelSchedule);

export default router;


