import { Request, Response } from 'express';
import { generateImportTemplate } from '@/lib/excelUtils';
import logger from '@/lib/logger';

export const templateData = async (req: Request, res: Response) => {
  try {
    const { dataType } = req.params;

    const validDataTypes = ['users', 'clients', 'client-attendees', 'meets'];
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Invalid data type. Must be one of: users, clients, client-attendees, meets',
      });
    }

    const { buffer, fileName } = await generateImportTemplate(dataType);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    logger.error('Template data error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};


