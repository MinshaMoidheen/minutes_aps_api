import { Schema, model } from 'mongoose';

export interface IMeetingType {
  title: string;
  description?: string;
  refAdmin: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const meetingTypeSchema = new Schema<IMeetingType>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxLength: [100, 'Title must be less than 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxLength: [500, 'Description must be less than 500 characters'],
      trim: true,
    },
    refAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reference admin is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add index for performance
meetingTypeSchema.index({ refAdmin: 1 });
meetingTypeSchema.index({ title: 1 });

export default model<IMeetingType>('MeetingType', meetingTypeSchema);

