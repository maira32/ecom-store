import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; 
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    select: false,
  },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },

  isPremium: { type: Boolean, default: false },
stripeCustomerId: { type: String },
stripeSubscriptionId: { type: String },
  
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);