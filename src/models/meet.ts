import { Schema, model, Types } from 'mongoose';

export interface IMeet {
  title: string;
  meetingTypeId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime: string; // Format: "09:00"
  endTime: string; // Format: "10:00"
  location?: string;
  clientId?: Types.ObjectId;
  attendeeIds: Types.ObjectId[]; // Array of client attendee IDs who are invited to the meeting
  agenda?: string; // Replaces description: list/names of agents
  meetingPoints?: Array<{
    pointsDiscussed: string;
    planOfAction: string;
    accountability: string;
    status?: 'pending' | 'complete';
  }>;
  closureReport?: string;
  otherAttendees?: string; // Additional attendees not in the system
  organizer: string; // Name of the organizer
  status: 'incoming' | 'ongoing' | 'previous';
  refAdmin: Types.ObjectId; // Reference to admin who created this schedule
  meetingLink?: string; // For virtual meetings
  notes?: string; // Additional notes
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const meetSchema = new Schema<IMeet>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxLength: [100, 'Title must be less than 100 characters'],
      trim: true,
    },
    meetingTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingType',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'],
      default: '09:00',
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'],
      default: '10:00',
    },
    location: {
      type: String,
      maxLength: [200, 'Location must be less than 200 characters'],
      trim: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    attendeeIds: [{
      type: Schema.Types.ObjectId,
      ref: 'ClientAttendee',
    }],
    agenda: {
      type: String,
      maxLength: [500, 'Agenda must be less than 500 characters'],
      trim: true,
    },
    meetingPoints: [
      {
        pointsDiscussed: { type: String, trim: true, maxLength: 2000 },
        planOfAction: { type: String, trim: true, maxLength: 2000 },
        accountability: { type: String, trim: true, maxLength: 200 },
        status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
      },
    ],
    closureReport: {
      type: String,
      trim: true,
      maxLength: [5000, 'Closure report must be less than 5000 characters'],
    },
    otherAttendees: {
      type: String,
      maxLength: [500, 'Other attendees must be less than 500 characters'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      maxLength: [50, 'Organizer name must be less than 50 characters'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['incoming', 'ongoing', 'previous'],
        message: '{VALUE} is not a valid status',
      },
      default: 'incoming',
    },
    refAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reference admin is required'],
    },
    meetingLink: {
      type: String,
      maxLength: [200, 'Meeting link must be less than 200 characters'],
      trim: true,
    },
    notes: {
      type: String,
      maxLength: [1000, 'Notes must be less than 1000 characters'],
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
meetSchema.index({ refAdmin: 1 });
meetSchema.index({ status: 1 });
meetSchema.index({ startDate: 1 });
meetSchema.index({ endDate: 1 });
meetSchema.index({ isActive: 1 });
meetSchema.index({ createdAt: 1 });
meetSchema.index({ startDate: 1, endDate: 1 });

export default model<IMeet>('Meet', meetSchema);
