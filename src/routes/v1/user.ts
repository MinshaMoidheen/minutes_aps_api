import { Router } from 'express';
import { z } from 'zod';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';

import User from '@/models/user';
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';
import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';
import getAllUser from '@/controllers/v1/user/get_all_user';
import getAllAdmin from '@/controllers/v1/user/get_all_admin';
import getUser from '@/controllers/v1/user/get_user';
import updateUser from '@/controllers/v1/user/update_user';
import deleteUser from '@/controllers/v1/user/delete_user';
import createUser from '@/controllers/v1/user/create_user';
import searchUsers from '@/controllers/v1/user/search_users';
import {
  UpdateUserSchema,
  CreateUserSchema,
  UserIdParamSchema,
  QueryLimitOffset,
  UserSearchSchema,
} from '@/zod/user';

const router = Router();

const validate =
  (schema: z.ZodTypeAny, target: string = 'body') =>
  (req: any, res: any, next: any) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (err: any) {
      res.status(400).json({ code: 'Validation Error', errors: err.errors });
    }
  };

// Routes
router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  validate(UpdateUserSchema),
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.post(
  '/',
  authenticate,
  authorize(['admin', 'superadmin']),
  validate(CreateUserSchema),
  createUser,
);

router.get(
  '/',
  authenticate,
  authorize(['admin','superadmin']),
 
  getAllUser,
);

router.get(
  '/admins',
  authenticate,
  authorize(['admin', 'superadmin']),
  getAllAdmin,
);

router.get(
  '/search',
  authenticate,
  authorize(['admin', 'superadmin']),
  validate(UserSearchSchema, 'query'),
  searchUsers,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin','superadmin']),
  validate(UserIdParamSchema, 'params'),
  getUser,
);

router.put(
  '/:userId',
  authenticate,
  authorize(['admin','superadmin']),
  validate(UserIdParamSchema, 'params'),
  validate(UpdateUserSchema),
  updateUser,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin','superadmin']),
  validate(UserIdParamSchema, 'params'),
  deleteUser,
);

export default router;
