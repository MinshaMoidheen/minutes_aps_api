import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import config from '@/config';
import { genUsername } from '@/utils';

import User from '@/models/user';
import Token from '@/models/token';

import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type userData = {
  username?: string;
  email: string;
  password: string;
  role?: string;
  company?: string;
  refAdmin?: string;
  designation?: string;
  
};

const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, company, refAdmin, designation} = req.body as userData;
  const adminId = req.userId; // Admin who is creating the user

  console.log("req.body", req.body);
  try {
    // Use provided username or generate one if not provided or empty
    const finalUsername = (username && username.trim()) || genUsername();

    console.log('Creating user with username:', finalUsername);

    const userData: any = {
      username: finalUsername,
      email,
      password,
      role: role || 'user',
      company: company || '',
      refAdmin: refAdmin || adminId,
      designation: designation || '',
    };

  

    const newUser = await User.create(userData);

    // Generate access token and refresh token for new user
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token in db
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });

    res.status(201).json({
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company,
        refAdmin: newUser.refAdmin,
        createdAt: (newUser as any).createdAt,
        updatedAt: (newUser as any).updatedAt,
      },
      accessToken,
    });

    // Log successful user creation by admin
    await logger.log(
      newUser as any,
      'CREATE_USER',
      'USER',
      `User created by admin: ${newUser.email}`,
      newUser._id.toString(),
      [
        { field: 'username', oldValue: null, newValue: newUser.username },
        { field: 'email', oldValue: null, newValue: newUser.email },
        { field: 'role', oldValue: null, newValue: newUser.role },
        { field: 'refAdmin', oldValue: null, newValue: adminId?.toString() },
      ]
    );

    logger.info('User created by admin successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdBy: adminId,
    });
  } catch (err) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: err,
    });
    logger.error('Error during user creation by admin', err);
  }
};

export default createUser;
