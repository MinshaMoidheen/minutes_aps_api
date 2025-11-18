import logger from '@/lib/logger';

import Log from '@/models/log';

import type { Request, Response } from 'express';

const deleteLog = async (req: Request, res: Response): Promise<void> => {
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

    const deletedLog = await Log.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    // Log the log deletion
    await logger.log(
      req.user as any,
      'DELETE',
      'LOG',
      `Log entry deleted - ID: ${req.params.id}, Action: ${existingLog.action}, Module: ${existingLog.module}`,
      undefined, // Document is deleted
      [
        { field: 'action', oldValue: existingLog.action, newValue: 'DELETED' },
        { field: 'module', oldValue: existingLog.module, newValue: 'DELETED' },
        { field: 'description', oldValue: existingLog.description, newValue: 'DELETED' },
        { field: 'userRole', oldValue: existingLog.userRole, newValue: 'DELETED' },
        { field: 'deletedAt', oldValue: null, newValue: new Date() },
      ]
    );

    res.status(200).json({
      message: 'Log deleted successfully',
      deletedLog: {
        id: existingLog._id,
        action: existingLog.action,
        module: existingLog.module,
        description: existingLog.description,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 'Server Error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.error('Error while deleting log', error);
  }
};

export default deleteLog;
