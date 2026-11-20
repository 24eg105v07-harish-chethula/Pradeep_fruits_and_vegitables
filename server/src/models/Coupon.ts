import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountPercentage: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  isActive: boolean;
  validUntil: Date;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    validUntil: { type: Date, required: true },
    usedCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: 'coupons'
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
