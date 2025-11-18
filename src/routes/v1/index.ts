import { Router } from 'express';

import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';
import logRoutes from '@/routes/v1/log';
import clientRoutes from '@/routes/v1/client';
import clientAttendeeRoutes from '@/routes/v1/clientAttendee';
import meetingTypeRoutes from '@/routes/v1/meetingType';
import importExportRoutes from '@/routes/v1/importExport';
import meetRoutes from '@/routes/v1/meet';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    docs: 'https://docs.example.com',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/clients', clientRoutes);
router.use('/client-attendees', clientAttendeeRoutes);
router.use('/meeting-types', meetingTypeRoutes);
router.use('/data', importExportRoutes);
router.use('/schedules', meetRoutes);

export default router;
