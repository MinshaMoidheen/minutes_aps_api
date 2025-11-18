import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  refAdmin?: Schema.Types.ObjectId;
  company?: string; // Company name for admin users
  designation?: string; // Job designation for regular users
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

// User Schema

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      masLength: [20, 'Username must be less than 20 characters'],
      unique: [true, 'Username must be unique'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email must be less than 50 characters'],
      unique: [true, 'Email must be unique'],
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Do not return password in queries
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['superadmin', 'admin', 'user'],
        message: '{VALUE} is not supported',
      },
      default: 'user',
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name must be less than 20 characters'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name must be less than 20 characters'],
    },
    refAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    company: {
      type: String,
      maxLength: [100, 'Company name must be less than 100 characters'],
    },
    designation: {
      type: String,
      maxLength: [50, 'Designation must be less than 50 characters'],
    },
    phoneNumber: {
      type: String,
      maxLength: [15, 'Phone number must be less than 15 characters'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website address must be less than 100 characters'],
      },
      facebook: {
        type: String,
        maxLength: [100, 'Facebook profile must be less than 100 characters'],
      },
      instagram: {
        type: String,
        maxLength: [100, 'Instagram profile must be less than 100 characters'],
      },
      linkedin: {
        type: String,
        maxLength: [100, 'LinkedIn profile must be less than 100 characters'],
      },
      x: {
        type: String,
        maxLength: [100, 'X profile must be less than 100 characters'],
      },
      youtube: {
        type: String,
        maxLength: [
          100,
          'Youtube channel url must be less than 100 characters',
        ],
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  //Hash password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>('User', userSchema);
