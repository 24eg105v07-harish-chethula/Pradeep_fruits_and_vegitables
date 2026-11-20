import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: 'superadmin' | 'delivery_manager';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'delivery_manager'], default: 'superadmin' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
  },
  {
    timestamps: true,
    collection: 'admins'
  }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
