import { Router } from 'express';
import authenticate from '@/middlewares/authenticate';
import { requireAdmin } from '@/middlewares/roleBasedAccess';
import validateRequest from '@/middlewares/validationError';
import {
  createMeetingTypeSchema,
  updateMeetingTypeSchema,
  getMeetingTypesQuerySchema,
  deleteMeetingTypeSchema,
} from '@/zod/meetingType';
import {
  createMeetingType,
  getAllMeetingTypes,
  updateMeetingType,
  deleteMeetingType,
} from '@/controllers/v1/meetingType';

const router = Router();

// All meeting type routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Create meeting type
router.post(
  '/',
  validateRequest(createMeetingTypeSchema),
  createMeetingType
);

// Get all meeting types
router.get(
  '/',
  validateRequest(getMeetingTypesQuerySchema),
  getAllMeetingTypes
);

// Update meeting type
router.put(
  '/:id',
  validateRequest(updateMeetingTypeSchema),
  updateMeetingType
);

// Delete meeting type
router.delete(
  '/:id',
  validateRequest(deleteMeetingTypeSchema),
  deleteMeetingType
);

export default router;

