import { Schema, model } from 'mongoose';

export interface ILog {
  companyId?: string;
  action: string;
  module: string;
  description: string;
  userRole: string;
  userId: string;
  documentId?: string;
  changes: {
    field: string;
    oldValue?: any;
    newValue: any;
  }[];
}

const logSchema = new Schema<ILog>(
  {
    companyId: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      uppercase: true,
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    userRole: {
      type: String,
      required: [true, 'User role is required'],
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    documentId: {
      type: String,
      required: false,
    },
    changes: [
      {
        field: {
          type: String,
          required: [true, 'Field is required'],
          trim: true,
        },
        oldValue: {
          type: Schema.Types.Mixed,
          default: null,
        },
        newValue: {
          type: Schema.Types.Mixed,
          required: [true, 'New value is required'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
logSchema.index({ companyId: 1 });
logSchema.index({ action: 1 });
logSchema.index({ module: 1 });
logSchema.index({ userRole: 1 });
logSchema.index({ userId: 1 });
logSchema.index({ documentId: 1 });
logSchema.index({ createdAt: 1 });
logSchema.index({ updatedAt: 1 });
logSchema.index({ companyId: 1, action: 1 });
logSchema.index({ companyId: 1, module: 1 });
logSchema.index({ companyId: 1, userRole: 1 });
logSchema.index({ userId: 1, action: 1 });
logSchema.index({ module: 1, action: 1 });
logSchema.index({ companyId: 1, createdAt: 1 });
logSchema.index({ companyId: 1, documentId: 1 });

export default model<ILog>('Log', logSchema);
