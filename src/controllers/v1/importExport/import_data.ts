import { Request, Response } from 'express';
import { importFromExcel } from '@/lib/excelUtils';
import { validateFile } from '@/utils/fileValidation';
import logger from '@/lib/logger';

export const importData = async (req: Request, res: Response) => {
  try {
    const { dataType } = req.params;
    const refAdmin = req.userId!;

    const validDataTypes = ['users', 'clients', 'client-attendees', 'meets'];
    
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Invalid data type. Must be one of: users, clients, client-attendees, meets',
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Excel file is required',
      });
    }

    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    
    // Validate file using common utility
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      return res.status(400).json({
        code: 'ValidationError',
        message: fileValidation.error,
      });
    }

    const { importedCount, updatedCount, errors } = await importFromExcel(
      dataType, 
      file.data, 
      refAdmin
    );

    // Log the action
    await logger.log(
      req.user || null,
      'IMPORT',
      'DATA',
      `Imported ${dataType} data from Excel`,
      undefined,
      [
        { field: 'dataType', newValue: dataType },
        { field: 'importedCount', newValue: importedCount },
        { field: 'updatedCount', newValue: updatedCount },
        { field: 'errorCount', newValue: errors.length },
      ]
    );

    res.status(200).json({
      code: 'Success',
      message: 'Data imported successfully',
      data: {
        importedCount,
        updatedCount,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    logger.error('Import data error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
