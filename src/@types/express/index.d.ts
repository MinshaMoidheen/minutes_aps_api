import { Types } from 'mongoose';
import type { IUser } from '@/models/user';

declare global {
    namespace Express {
      interface Request {
        userId?: string;
        user?: IUser & { _id: string; companyId?: string };
      }
    }
}