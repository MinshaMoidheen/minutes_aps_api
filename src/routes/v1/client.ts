import { Router } from 'express';
import authenticate from '@/middlewares/authenticate';
import { requireAdmin, checkResourceAccess } from '@/middlewares/roleBasedAccess';
import validateRequest from '@/middlewares/validationError';
import {
  createClientSchema,
  updateClientSchema,
  getClientSchema,
  getClientsQuerySchema,
  deleteClientSchema,
} from '@/zod/client';
import {
  createClient,
  getAllClients,
  getClient,
  updateClient,
  deleteClient,
} from '@/controllers/v1/client';

const router = Router();

// All client routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Create client
router.post(
  '/',
  validateRequest(createClientSchema),
  createClient
);

// Get all clients
router.get(
  '/',
  validateRequest(getClientsQuerySchema),
  getAllClients
);

// Get client by ID
router.get(
  '/:id',
  validateRequest(getClientSchema),
  checkResourceAccess('client'),
  getClient
);

// Update client
router.put(
  '/:id',
  validateRequest(updateClientSchema),
  checkResourceAccess('client'),
  updateClient
);

// Delete client
router.delete(
  '/:id',
  validateRequest(deleteClientSchema),
  checkResourceAccess('client'),
  deleteClient
);

export default router;
