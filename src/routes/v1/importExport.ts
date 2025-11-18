import { Router } from 'express';
import authenticate from '@/middlewares/authenticate';
import { requireAdmin } from '@/middlewares/roleBasedAccess';
import { exportData, importData, templateData } from '@/controllers/v1/importExport';
import { createFileUploadMiddleware } from '@/config/fileUpload';

const router = Router();

// Configure file upload middleware using common config
const uploadMiddleware = createFileUploadMiddleware();

// All import/export routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Export data to Excel
router.get('/export/:dataType', exportData);

// Import data from Excel
router.post('/import/:dataType', uploadMiddleware, importData);

// Download import template with examples
router.get('/import/template/:dataType', templateData);

export default router;
