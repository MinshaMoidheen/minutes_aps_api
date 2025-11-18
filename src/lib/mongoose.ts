import mongoose from 'mongoose';

import config from '@/config';
import logger from '@/lib/logger';

import { ConnectOptions } from 'mongoose';

const clientOptions: ConnectOptions = {
  dbName: 'smaya',
  appName: 'smaya',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error('MONGO_URL is not defined in the configuration');
  }
  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info('MongoDB connected successfully', { uri: config.MONGO_URI, options: clientOptions });
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    logger.error('Error connecting to database:', err);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from the database successfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    logger.error('Error disconnecting from the database:', err);
  }
};
