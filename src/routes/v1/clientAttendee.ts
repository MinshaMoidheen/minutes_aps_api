import { Router } from 'express';
import authenticate from '@/middlewares/authenticate';
import { requireAdmin } from '@/middlewares/roleBasedAccess';
import validateRequest from '@/middlewares/validationError';
import {
  createClientAttendeeSchema,
  updateClientAttendeeSchema,
  getClientAttendeesQuerySchema,
  deleteClientAttendeeSchema,
} from '@/zod/clientAttendee';
import {
  createClientAttendee,
  getAllClientAttendees,
  updateClientAttendee,
  deleteClientAttendee,
} from '@/controllers/v1/clientAttendee';

const router = Router();

// All client attendee routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Create client attendee
router.post(
  '/',
  validateRequest(createClientAttendeeSchema),
  createClientAttendee
);

// Get all client attendees
router.get(
  '/',
  validateRequest(getClientAttendeesQuerySchema),
  getAllClientAttendees
);

// Update client attendee
router.put(
  '/:id',
  validateRequest(updateClientAttendeeSchema),
  updateClientAttendee
);

// Delete client attendee
router.delete(
  '/:id',
  validateRequest(deleteClientAttendeeSchema),
  deleteClientAttendee
);

export default router;

