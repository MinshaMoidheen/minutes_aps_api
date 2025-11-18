import { Schema, model, Types } from 'mongoose';

export interface IClient {
  username: string;
  email: string;
  phoneNumber: string;
  refAdmin: Types.ObjectId; // Reference to admin who created this client
  company?: string;
  address?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const clientSchema = new Schema<IClient>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      maxLength: [50, 'Username must be less than 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [100, 'Email must be less than 100 characters'],
      unique: [true, 'Email must be unique'],
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      maxLength: [15, 'Phone number must be less than 15 characters'],
      trim: true,
    },
    refAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reference admin is required'],
    },
    company: {
      type: String,
      maxLength: [100, 'Company name must be less than 100 characters'],
      trim: true,
    },
    address: {
      type: String,
      maxLength: [200, 'Address must be less than 200 characters'],
      trim: true,
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

// Add indexes for performance
clientSchema.index({ email: 1 });
clientSchema.index({ refAdmin: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ createdAt: 1 });

export default model<IClient>('Client', clientSchema);
