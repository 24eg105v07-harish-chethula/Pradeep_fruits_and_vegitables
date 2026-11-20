import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAddress {
  houseNo: string;
  street: string;
  area: string;
  town: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  recipientName: string;
  customerMobile: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  addresses: IUserAddress[];
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    houseNo: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    town: { type: String, required: true, default: 'Kothagudem', trim: true },
    district: { type: String, required: true, default: 'Bhadradri Kothagudem', trim: true },
    state: { type: String, required: true, default: 'Telangana', trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    recipientName: { type: String, required: true, trim: true },
    customerMobile: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    addresses: [AddressSchema],
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
