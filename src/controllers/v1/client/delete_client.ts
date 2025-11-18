import { Request, Response } from 'express';
import Client from '@/models/client';
import Meet from '@/models/meet';
import logger from '@/lib/logger';

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the current client data for logging
    const currentClient = await Client.findOne({ _id: id, refAdmin: req.userId })
      .lean()
      .exec();

    if (!currentClient) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client not found',
      });
    }

    // Check if client has associated meets
    const meetCount = await Meet.countDocuments({ refAdmin: req.userId });

    if (meetCount > 0) {
      return res.status(400).json({
        code: 'ValidationError',
        message: `Cannot delete client. It has ${meetCount} meets associated with it.`,
      });
    }

    await Client.deleteOne({ _id: id, refAdmin: req.userId });

    // Log the action
    await logger.log(
      req.user || null,
      'DELETE',
      'CLIENT',
      `Deleted client: ${currentClient.username} (${currentClient.email})`,
      currentClient._id.toString(),
      [
        { field: 'username', oldValue: currentClient.username, newValue: null },
        { field: 'email', oldValue: currentClient.email, newValue: null },
        { field: 'phoneNumber', oldValue: currentClient.phoneNumber, newValue: null },
        { field: 'company', oldValue: currentClient.company, newValue: null },
        { field: 'address', oldValue: currentClient.address, newValue: null },
      ]
    );

    res.status(200).json({
      code: 'Success',
      message: 'Client deleted successfully',
    });
  } catch (error) {
    logger.error('Delete client error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
