import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

import logger from '@/lib/logger';
import config from '@/config';
import { genUsername } from '@/utils';

import User from '@/models/user';
import Token from '@/models/token';

import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type userData = Pick<IUser,'username' | 'email' | 'password' | 'role'>;

/**
 * Check if a creator role can create a target role based on hierarchy
 * @param creatorRole - The role of the user creating the account
 * @param targetRole - The role being created
 * @returns boolean - true if creation is allowed
 */
const checkRoleHierarchy = (creatorRole: string, targetRole: string): boolean => {
  const hierarchy: Record<string, string[]> = {
    superadmin: ['admin', 'user'], // Super admin can create admin and user
    admin: ['user'], // Admin can only create users
    user: [], // Users cannot create any accounts
  };

  return hierarchy[creatorRole]?.includes(targetRole) || false;
};

const register = async (req: Request, res: Response): Promise<void> => {
  const {username, email, password, role } = req.body as userData;
  const adminId = req.userId; // Will be undefined for self-registration
  const targetRole = role || 'user'; // Default to 'user' if no role specified

  // Prevent super admin creation/registration
  if (targetRole === 'superadmin') {
    await logger.log(
      adminId ? await User.findById(adminId).select('role') as any : null,
      'REGISTER_FAILED',
      'AUTH',
      `Super admin creation attempt blocked: ${email}`,
      adminId,
      [
        { field: 'email', oldValue: null, newValue: email },
        { field: 'requestedRole', oldValue: null, newValue: targetRole },
        { field: 'reason', oldValue: null, newValue: 'Super admin cannot be created or registered' },
      ]
    );

    res.status(403).json({
      code: 'Authorization Error',
      message: 'Super admin accounts cannot be created or registered',
    });
    logger.warn(
      `Attempt to create super admin account for ${email} was blocked`,
    );
    return;
  }

  // For admin and user roles, authentication is required
  if (!adminId) {
    await logger.log(
      null,
      'REGISTER_FAILED',
      'AUTH',
      `Unauthorized ${targetRole} registration attempt: ${email}`,
      undefined,
      [
        { field: 'email', oldValue: null, newValue: email },
        { field: 'requestedRole', oldValue: null, newValue: targetRole },
        { field: 'reason', oldValue: null, newValue: 'Authentication required' },
      ]
    );

    res.status(403).json({
      code: 'Authorization Error',
      message: `Authentication required to register as ${targetRole}`,
    });
    logger.warn(
      `User with email ${email} tried to register as ${targetRole} without authentication.`,
    );
    return;
  }

  // Check role hierarchy permissions
  const creator = await User.findById(adminId).select('role');
  if (!creator) {
    res.status(401).json({
      code: 'Authentication Error',
      message: 'Creator user not found',
    });
    return;
  }

  // Role hierarchy check
  const canCreate = checkRoleHierarchy(creator.role, targetRole);
  if (!canCreate) {
    await logger.log(
      creator as any,
      'REGISTER_FAILED',
      'AUTH',
      `Unauthorized ${targetRole} creation attempt: ${email}`,
      adminId,
      [
        { field: 'email', oldValue: null, newValue: email },
        { field: 'requestedRole', oldValue: null, newValue: targetRole },
        { field: 'creatorRole', oldValue: null, newValue: creator.role },
        { field: 'reason', oldValue: null, newValue: 'Insufficient permissions' },
      ]
    );

    res.status(403).json({
      code: 'Authorization Error',
      message: `${creator.role} cannot create ${targetRole} accounts`,
    });
    logger.warn(
      `User with role ${creator.role} tried to create ${targetRole} account for ${email}`,
    );
    return;
  }

  // console.log(email, password, role);

  try {
   

    const newUser = await User.create({
      username,
      email,
      password,
      role: targetRole,
      refAdmin: adminId, // Set refAdmin if user is created by an admin
    });

    //Generate access token and refresh token for new user
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    //Store refresh token in db
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    // Log successful registration
    await logger.log(
      newUser as any,
      'REGISTER',
      'AUTH',
      `User registered successfully: ${newUser.email}`,
      newUser._id.toString(),
      [
        { field: 'username', oldValue: null, newValue: newUser.username },
        { field: 'email', oldValue: null, newValue: newUser.email },
        { field: 'role', oldValue: null, newValue: newUser.role },
      ]
    );

    logger.info('User registered successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: err,
    });
    logger.error('Error during user registration', err);
  }
};

export default register;
