import logger from '@/lib/logger';

import Log from '@/models/log';

import type { Request, Response } from 'express';

const updateLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingLog = await Log.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!existingLog) {
      res.status(404).json({
        code: 'Not Found',
        message: 'Log not found',
      });
      return;
    }

    const updatedLog = await Log.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.user?.companyId,
      },
      req.body,
      { new: true, runValidators: true }
    );

    // Log the log update
    await logger.log(
      req.user as any,
      'UPDATE',
      'LOG',
      `Log entry updated - ID: ${req.params.id}, Action: ${req.body.action || existingLog.action}, Module: ${req.body.module || existingLog.module}`,
      updatedLog?._id.toString(),
      [
        { field: 'action', oldValue: existingLog.action, newValue: req.body.action || existingLog.action },
        { field: 'module', oldValue: existingLog.module, newValue: req.body.module || existingLog.module },
        { field: 'description', oldValue: existingLog.description, newValue: req.body.description || existingLog.description },
        { field: 'userRole', oldValue: existingLog.userRole, newValue: req.body.userRole || existingLog.userRole },
        { field: 'updatedAt', oldValue: (existingLog as any).updatedAt?.toISOString(), newValue: new Date().toISOString() },
      ]
    );

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(400).json({
      code: 'Bad Request',
      message: error instanceof Error ? error.message : 'Invalid request data',
    });
    logger.error('Error while updating log', error);
  }
};

export default updateLog;
