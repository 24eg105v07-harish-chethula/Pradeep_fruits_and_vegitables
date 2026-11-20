import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  userId?: mongoose.Types.ObjectId;
  recipientName: string;
  customerMobile: string;
  houseNo: string;
  street: string;
  area: string;
  town: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    recipientName: { type: String, required: true, trim: true },
    customerMobile: { type: String, required: true, trim: true },
    houseNo: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    town: { type: String, required: true, default: 'Kothagudem', trim: true },
    district: { type: String, required: true, default: 'Bhadradri Kothagudem', trim: true },
    state: { type: String, required: true, default: 'Telangana', trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: 'addresses'
  }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
