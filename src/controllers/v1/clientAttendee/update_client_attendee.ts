import { Request, Response } from 'express';
import ClientAttendee from '@/models/clientAttendee';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const updateClientAttendee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, phoneNumber, clientId, designation, department, isActive } = req.body;
    const refAdmin = req.userId;

    // Find attendee
    const attendee = await ClientAttendee.findOne({ _id: id, refAdmin });
    if (!attendee) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client attendee not found or access denied',
      });
    }

    // Verify client exists and belongs to admin if clientId is being updated
    if (clientId && clientId !== attendee.clientId.toString()) {
      const client = await Client.findOne({ _id: clientId, refAdmin }).lean().exec();
      if (!client) {
        return res.status(404).json({
          code: 'NotFoundError',
          message: 'Client not found or access denied',
        });
      }
    }

    // Update attendee fields
    if (username) attendee.username = username;
    if (email) attendee.email = email;
    if (phoneNumber) attendee.phoneNumber = phoneNumber;
    if (clientId) attendee.clientId = clientId;
    if (designation !== undefined) attendee.designation = designation;
    if (department !== undefined) attendee.department = department;
    if (isActive !== undefined) attendee.isActive = isActive;

    await attendee.save();

    res.status(200).json({
      code: 'Success',
      message: 'Client attendee updated successfully',
      data: {
        id: attendee._id,
        username: attendee.username,
        email: attendee.email,
        phoneNumber: attendee.phoneNumber,
        clientId: attendee.clientId,
        designation: attendee.designation,
        department: attendee.department,
        isActive: attendee.isActive,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Update client attendee error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};

