import { Request, Response } from 'express';
import ClientAttendee from '@/models/clientAttendee';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const createClientAttendee = async (req: Request, res: Response) => {
  try {
    const { username, email, phoneNumber, clientId, designation, department } = req.body;
    const refAdmin = req.userId;

    // Verify client exists and belongs to admin
    const client = await Client.findOne({ _id: clientId, refAdmin }).lean().exec();
    if (!client) {
      return res.status(404).json({
        code: 'NotFoundError',
        message: 'Client not found or access denied',
      });
    }

    // Check if attendee with email already exists
    const existingAttendee = await ClientAttendee.findOne({ email }).lean().exec();
    if (existingAttendee) {
      return res.status(409).json({
        code: 'ConflictError',
        message: 'Attendee with this email already exists',
      });
    }

    const attendee = await ClientAttendee.create({
      username,
      email,
      phoneNumber,
      clientId,
      designation,
      department,
      refAdmin,
    });

    // Log the action
    await logger.log(
      req.user || null,
      'CREATE',
      'CLIENT_ATTENDEE',
      `Created new client attendee: ${attendee.username} (${attendee.email})`,
      attendee._id.toString(),
      [
        { field: 'username', newValue: attendee.username },
        { field: 'email', newValue: attendee.email },
        { field: 'phoneNumber', newValue: attendee.phoneNumber },
        { field: 'clientId', newValue: attendee.clientId },
        { field: 'designation', newValue: attendee.designation },
        { field: 'department', newValue: attendee.department },
      ]
    );

    res.status(201).json({
      code: 'Success',
      message: 'Client attendee created successfully',
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
      },
    });
  } catch (error) {
    logger.error('Create client attendee error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
