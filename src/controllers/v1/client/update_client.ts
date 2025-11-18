import { Request, Response } from 'express';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== currentClient.email) {
      const existingClient = await Client.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      }).lean().exec();
      
      if (existingClient) {
        return res.status(409).json({
          code: 'ConflictError',
          message: 'Client with this email already exists',
        });
      }
    }

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, refAdmin: req.userId },
      updateData,
      { new: true, runValidators: true }
    )
      .select('-__v')
      .lean()
      .exec();

    if (!updatedClient) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client not found',
      });
    }

    // Log the changes
    const changes = Object.keys(updateData).map(key => ({
      field: key,
      oldValue: currentClient[key as keyof typeof currentClient],
      newValue: updateData[key],
    }));

    await logger.log(
      req.user || null,
      'UPDATE',
      'CLIENT',
      `Updated client: ${updatedClient.username} (${updatedClient.email})`,
      updatedClient._id.toString(),
      changes
    );

    res.status(200).json({
      code: 'Success',
      message: 'Client updated successfully',
      data: updatedClient,
    });
  } catch (error) {
    logger.error('Update client error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
