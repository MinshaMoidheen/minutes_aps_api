import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { defaultFileUpload } from '@/config/fileUpload';

import type { CorsOptions } from 'cors';

import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import logger from '@/lib/logger';
import { seedSuperAdmin } from '@/lib/seed';

import v1Routes from '@/routes/v1';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      // When credentials are involved, return the specific origin instead of true
      callback(null, origin || true);
    } else {
      callback(
        new Error(`CORS Error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
    }
  },
  credentials: true, // Allow credentials (cookies) to be sent with requests
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(defaultFileUpload);

app.use(helmet());

app.use(limiter);

app.use(compression({ threshold: 1024 }));

(async () => {
  try {
    await connectToDatabase();
    
    // Seed super admin if it doesn't exist
    await seedSuperAdmin();
    
    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.warn('Failed to start server', err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
