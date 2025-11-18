import { Request, Response } from 'express';
import { exportToExcel } from '@/lib/excelUtils';
import logger from '@/lib/logger';

export const exportData = async (req: Request, res: Response) => {
  try {
    const { dataType } = req.params;
    const refAdmin = req.userId!;
    const {
      startDate: startDateStr,
      endDate: endDateStr,
      meetingTypeId,
      clientId,
    } = req.query as {
      startDate?: string;
      endDate?: string;
      meetingTypeId?: string;
      clientId?: string;
    };


    console.log("req.params",req.params)
    console.log("req.query",req.query)
    // Only meetings export is supported
    const validDataTypes = ['meets'];
    
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Invalid data type. Must be one of: users, clients, client-attendees, meets',
      });
    }

    // Parse optional date filters
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (startDateStr) {
      const d = new Date(startDateStr);
      if (!isNaN(d.getTime())) {
        startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      }
    }
    if (endDateStr) {
      const d = new Date(endDateStr);
      if (!isNaN(d.getTime())) {
        endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
      }
    }

    const { buffer, fileName } = await exportToExcel(dataType, refAdmin, {
      startDate,
      endDate,
      meetingTypeId,
      clientId,
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    // Log the action
    await logger.log(
      req.user || null,
      'EXPORT',
      'DATA',
      `Exported ${dataType} data to Excel`,
      undefined,
      [
        { field: 'dataType', newValue: dataType },
        ...(startDate ? [{ field: 'startDate', newValue: startDate.toISOString() }] : []),
        ...(endDate ? [{ field: 'endDate', newValue: endDate.toISOString() }] : []),
      ]
    );

    res.send(buffer);
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
