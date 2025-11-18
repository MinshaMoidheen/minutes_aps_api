import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import register from '@/controllers/v1/auth/register';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import logout from '@/controllers/v1/auth/logout';

import User from '@/models/user';

import authenticate from '@/middlewares/authenticate';
import { RegisterSchema, LoginSchema, RefreshSchema } from '@/zod/auth';

const router = Router();

// Zod validation middleware helper
const validate =
  (schema: z.ZodTypeAny) => async (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ code: 'Validation Error', errors: err.errors });
    }
  };


// Admin-created user registration (requires authentication)
router.post('/register', authenticate, validate(RegisterSchema), register);

// Login Schema and Route
router.post('/login', validate(LoginSchema), login);

// Refresh Token (cookie; slightly different usage)
const validateRefreshToken = (req: any, res: any, next: any) => {
  try {
    const { refreshToken } = req.cookies;
    RefreshSchema.parse({ refreshToken });
    return next();
  } catch (err: any) {
    return res
      .status(400)
      .json({ code: 'Validation Error', errors: err.errors });
  }
};

router.post('/refresh-token', validateRefreshToken, refreshToken);

router.post('/logout', authenticate, logout);

export default router;
