import logger from '@/lib/logger';

import User from '@/models/user';

import type { Request, Response } from 'express';

const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  const {
    username,
    email,
    password,
    first_name,
    last_name,
    website,
    facebook,
    instagram,
    linkedin,
    x,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    // Store old values for logging
    const oldValues = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      socialLinks: user.socialLinks,
    };

    const changes: any[] = [];

    if (username && username !== user.username) {
      user.username = username;
      changes.push({ field: 'username', oldValue: oldValues.username, newValue: username });
    }
    if (email && email !== user.email) {
      user.email = email;
      changes.push({ field: 'email', oldValue: oldValues.email, newValue: email });
    }
    if (password) {
      user.password = password;
      changes.push({ field: 'password', oldValue: '[HIDDEN]', newValue: '[UPDATED]' });
    }
    if (first_name && first_name !== user.firstName) {
      user.firstName = first_name;
      changes.push({ field: 'firstName', oldValue: oldValues.firstName, newValue: first_name });
    }
    if (last_name && last_name !== user.lastName) {
      user.lastName = last_name;
      changes.push({ field: 'lastName', oldValue: oldValues.lastName, newValue: last_name });
    }
    if (!user.socialLinks) {
      user.socialLinks = {};
    }
    if (website && website !== user.socialLinks.website) {
      user.socialLinks.website = website;
      changes.push({ field: 'socialLinks.website', oldValue: oldValues.socialLinks?.website, newValue: website });
    }
    if (facebook && facebook !== user.socialLinks.facebook) {
      user.socialLinks.facebook = facebook;
      changes.push({ field: 'socialLinks.facebook', oldValue: oldValues.socialLinks?.facebook, newValue: facebook });
    }
    if (instagram && instagram !== user.socialLinks.instagram) {
      user.socialLinks.instagram = instagram;
      changes.push({ field: 'socialLinks.instagram', oldValue: oldValues.socialLinks?.instagram, newValue: instagram });
    }
    if (linkedin && linkedin !== user.socialLinks.linkedin) {
      user.socialLinks.linkedin = linkedin;
      changes.push({ field: 'socialLinks.linkedin', oldValue: oldValues.socialLinks?.linkedin, newValue: linkedin });
    }
    if (x && x !== user.socialLinks.x) {
      user.socialLinks.x = x;
      changes.push({ field: 'socialLinks.x', oldValue: oldValues.socialLinks?.x, newValue: x });
    }
    if (youtube && youtube !== user.socialLinks.youtube) {
      user.socialLinks.youtube = youtube;
      changes.push({ field: 'socialLinks.youtube', oldValue: oldValues.socialLinks?.youtube, newValue: youtube });
    }

    await user.save();

    // Log user update if there were changes
    if (changes.length > 0) {
      await logger.log(
        user as any,
        'UPDATE',
        'USER',
        `User profile updated: ${user.email}`,
        user._id.toString(),
        changes
      );
    }

    logger.info('User updated successfully', user);

    res.status(200).json({
      user
    });

  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      err,
    });
    logger.error('Error while updating current user', err);
    return;
  }
};

export default updateCurrentUser;
