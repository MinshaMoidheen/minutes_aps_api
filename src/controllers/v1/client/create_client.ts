import { Request, Response } from 'express';
import Client from '@/models/client';
import logger from '@/lib/logger';

export const createClient = async (req: Request, res: Response) => {
  try {
    const { username, email, phoneNumber, company, address } = req.body;
    const refAdmin = req.userId;

    // Check if client with email already exists
    const existingClient = await Client.findOne({ email }).lean().exec();
    if (existingClient) {
      return res.status(409).json({
        code: 'ConflictError',
        message: 'Client with this email already exists',
      });
    }

    const client = await Client.create({
      username,
      email,
      phoneNumber,
      company,
      address,
      refAdmin,
    });

    // Log the action
    await logger.log(
      req.user || null,
      'CREATE',
      'CLIENT',
      `Created new client: ${client.username} (${client.email})`,
      client._id.toString(),
      [
        { field: 'username', newValue: client.username },
        { field: 'email', newValue: client.email },
        { field: 'phoneNumber', newValue: client.phoneNumber },
        { field: 'company', newValue: client.company },
        { field: 'address', newValue: client.address },
      ]
    );

    res.status(201).json({
      code: 'Success',
      message: 'Client created successfully',
      data: {
        id: client._id,
        username: client.username,
        email: client.email,
        phoneNumber: client.phoneNumber,
        company: client.company,
        address: client.address,
        isActive: client.isActive,
        createdAt: client.createdAt,
      },
    });
  } catch (error) {
    logger.error('Create client error:', error);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'Internal server error',
    });
  }
};
