import fileUpload from 'express-fileupload';

// File upload configuration
export const fileUploadConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    return allowedTypes.includes(file.mimetype);
  },
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached (10MB max)',
  createParentPath: true,
  useTempFiles: false, // Use memory storage for better performance
  tempFileDir: '/tmp/',
  debug: process.env.NODE_ENV === 'development',
};

// Allowed file types for validation
export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
];

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5, // Maximum number of files per request
};

// Create the file upload middleware
export const createFileUploadMiddleware = (options?: Partial<typeof fileUploadConfig>) => {
  return fileUpload({
    ...fileUploadConfig,
    ...options,
  });
};

// Default file upload middleware
export const defaultFileUpload = createFileUploadMiddleware();

export default fileUploadConfig;
