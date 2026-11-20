import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceArea extends Document {
  areaName: string;
  town: string;
  district: string;
  state: string;
  pincode: string;
  isActive: boolean;
  baseDeliveryMinutes: number; // e.g. 25-30
  minimumOrder: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAreaSchema = new Schema<IServiceArea>(
  {
    areaName: { type: String, required: true, trim: true },
    town: { type: String, required: true, default: 'Kothagudem', trim: true },
    district: { type: String, required: true, default: 'Bhadradri Kothagudem', trim: true },
    state: { type: String, required: true, default: 'Telangana', trim: true },
    pincode: { type: String, required: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
    baseDeliveryMinutes: { type: Number, default: 30 },
    minimumOrder: { type: Number, default: 99 },
    deliveryCharge: { type: Number, default: 25 },
    freeDeliveryThreshold: { type: Number, default: 299 }
  },
  {
    timestamps: true,
    collection: 'service_areas'
  }
);

ServiceAreaSchema.index({ pincode: 1, areaName: 1 }, { unique: true });

export const ServiceArea = mongoose.model<IServiceArea>('ServiceArea', ServiceAreaSchema);
