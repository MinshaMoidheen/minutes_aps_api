import { ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '@/config/fileUpload';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

/**
 * Validate uploaded file
 */
export const validateFile = (
  file: any,
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    maxSize = FILE_SIZE_LIMITS.MAX_FILE_SIZE,
    allowedTypes = ALLOWED_FILE_TYPES,
    maxFiles = FILE_SIZE_LIMITS.MAX_FILES,
  } = options;

  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: 'File type not allowed. Only Excel and CSV files are accepted.',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate multiple files
 */
export const validateFiles = (
  files: any[],
  options: FileValidationOptions = {}
): FileValidationResult => {
  const { maxFiles = FILE_SIZE_LIMITS.MAX_FILES } = options;

  // Check number of files
  if (files.length > maxFiles) {
    return {
      isValid: false,
      error: `Too many files. Maximum ${maxFiles} files allowed.`,
    };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateFile(file, options);
    if (!validation.isValid) {
      return validation;
    }
  }

  return {
    isValid: true,
  };
};

/**
 * Get file extension from mimetype
 */
export const getFileExtension = (mimetype: string): string => {
  const extensions: { [key: string]: string } = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'text/csv': 'csv',
  };
  return extensions[mimetype] || 'unknown';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
