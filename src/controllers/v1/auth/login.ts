import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import config from '@/config';

import User from '@/models/user';
import Token from '@/models/token';

import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type userData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as userData;

    const user = await User.findOne({ email })
      .select('username email role password')
      .lean()
      .exec();

    if (!user) {
      // Log failed login attempt
      await logger.log(
        null,
        'LOGIN_FAILED',
        'AUTH',
        `Failed login attempt - User not found: ${email}`,
        undefined,
        [
          { field: 'email', oldValue: null, newValue: email },
          { field: 'reason', oldValue: null, newValue: 'User not found' },
        ]
      );

      res.status(404).json({
        code: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    //Generate access token and refresh token for new user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //Store refresh token in db
    await Token.create({
      userId: user._id,
      token: refreshToken,
    });
    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    // Log successful login
    await logger.log(
      user as any,
      'LOGIN',
      'AUTH',
      `User logged in successfully: ${user.email}`,
      user._id.toString(),
      [
        { field: 'email', oldValue: null, newValue: user.email },
        { field: 'username', oldValue: null, newValue: user.username },
        { field: 'role', oldValue: null, newValue: user.role },
      ]
    );

    logger.info('User logged in successfully', user);
  } catch (err) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: err,
    });
    logger.error('Error during user login', err);
  }
};

export default login;
