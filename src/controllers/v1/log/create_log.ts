import logger from '@/lib/logger';

import Log from '@/models/log';

import type { Request, Response } from 'express';

const createLog = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the log model
    const log = new Log({
      ...req.body,
      companyId: req.body.companyId || req.user?.companyId,
    });
    const savedLog = await log.save();

    // Log the log creation
    await logger.log(
      req.user as any,
      'CREATE',
      'LOG',
      `Manual log entry created - Action: ${req.body.action}, Module: ${req.body.module}`,
      savedLog._id.toString(),
      [
        { field: 'action', oldValue: null, newValue: req.body.action },
        { field: 'module', oldValue: null, newValue: req.body.module },
        { field: 'description', oldValue: null, newValue: req.body.description },
        { field: 'userRole', oldValue: null, newValue: req.body.userRole },
        { field: 'userId', oldValue: null, newValue: req.body.userId },
        { field: 'companyId', oldValue: null, newValue: req.body.companyId || req.user?.companyId },
      ]
    );

    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({
      code: 'Bad Request',
      message: error instanceof Error ? error.message : 'Invalid request data',
    });
    logger.error('Error creating log entry', error);
  }
};

export default createLog;
