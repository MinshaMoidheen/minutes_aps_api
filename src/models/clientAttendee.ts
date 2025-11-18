import { Schema, model, Types } from 'mongoose';

export interface IClientAttendee {
  username: string;
  email: string;
  phoneNumber: string;
  clientId: Types.ObjectId; // Reference to the client
  refAdmin: Types.ObjectId; // Reference to admin who created this attendee
  designation?: string;
  department?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const clientAttendeeSchema = new Schema<IClientAttendee>(
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client reference is required'],
    },
    refAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reference admin is required'],
    },
    designation: {
      type: String,
      maxLength: [50, 'Designation must be less than 50 characters'],
      trim: true,
    },
    department: {
      type: String,
      maxLength: [50, 'Department must be less than 50 characters'],
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
clientAttendeeSchema.index({ email: 1 });
clientAttendeeSchema.index({ clientId: 1 });
clientAttendeeSchema.index({ refAdmin: 1 });
clientAttendeeSchema.index({ isActive: 1 });
clientAttendeeSchema.index({ createdAt: 1 });

export default model<IClientAttendee>('ClientAttendee', clientAttendeeSchema);
