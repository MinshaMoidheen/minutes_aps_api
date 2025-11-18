import Log from '@/models/log';
import type { IUser } from '@/models/user';

interface UserWithId extends IUser {
  _id: string | any;
  companyId?: string;
}

interface LogData {
  action: string;
  module: string;
  description: string;
  userRole?: string;
  documentId?: string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue: any;
  }[];
}

interface LogResult {
  success: boolean;
  logId?: string;
  message?: string;
  error?: string;
}

const logger = async (
  user: UserWithId | null,
  action: string,
  module: string,
  description: string,
  documentId?: string,
  changes?: LogData['changes'],
  userRole?: string
): Promise<LogResult> => {
  try {
    console.log('Logger called', { 
      action, 
      module, 
      description, 
      userId: user?._id,
      documentId 
    });

    // Handle special cases for anonymous users (like failed login attempts)
    let companyId: string | undefined;
    let userId: string;

    if (!user || !user._id) {
      // For anonymous users (like failed login attempts)
      companyId = user?.companyId || undefined;
      userId = user?._id?.toString() || 'anonymous';
    } else {
      // For regular users
      companyId = user.companyId || undefined;
      userId = user._id?.toString() || 'anonymous';
    }

    // For anonymous users, we need to handle the case where companyId might be null
    // Allow system actions and login failures without companyId
    if (!companyId && action !== 'LOGIN_FAILED' && module !== 'SYSTEM') {
      console.error('Logger validation failed', { 
        user, 
        action, 
        module, 
        description 
      });
      throw new Error('Invalid user object: must have companyId for non-anonymous actions');
    }

    // If userRole is not provided, try to get it from user object
    let finalUserRole = userRole;
    if (!finalUserRole) {
      if (typeof user?.role === 'string') {
        finalUserRole = user.role;
      } else if (user?.role && typeof user.role === 'object' && 'role' in user.role) {
        finalUserRole = (user.role as any).role;
      } else {
        finalUserRole = user?.role || 'user';
      }
    }

    // Validate changes structure if provided
    if (changes && Array.isArray(changes)) {
      for (const change of changes) {
        if (!change.field || (change.newValue === undefined && change.oldValue === undefined)) {
          console.error('Logger validation failed - invalid change object', { 
            change, 
            action, 
            module, 
            description 
          });
          throw new Error('Each change must have field property and at least one of oldValue or newValue');
        }
      }
    }

    // Create log entry for database
    const logEntry = new Log({
      companyId,
      action: action.toUpperCase(),
      module: module.toUpperCase(),
      description,
      userRole: finalUserRole,
      userId: userId,
      documentId,
      changes: changes || [],
    });

    // Save to database
    const savedLog = await logEntry.save();

    console.log('Log saved to database', { 
      logId: savedLog._id,
      action,
      module 
    });

    return {
      success: true,
      logId: savedLog._id.toString(),
      message: 'Log entry saved to database',
    };
  } catch (error) {
    console.error('Logger error', {
      action,
      module,
      userId: user?._id,
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Create a logger object with different log levels
const loggerObject = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  },
  // The main logging function for database logging
  log: logger,
};

export default loggerObject;
