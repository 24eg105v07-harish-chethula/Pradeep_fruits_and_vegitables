import mongoose, { Document, Schema } from 'mongoose';

export type ProductUnit = '250g' | '500g' | '1kg' | '1 piece' | '1 dozen' | '1 bunch' | '1 packet';

export interface IProduct extends Document {
  name: string;
  teluguName?: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  unit: ProductUnit;
  availableStock: number;
  images: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isDailyOffer: boolean;
  isOrganic: boolean;
  isSeasonal: boolean;
  isActive: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    teluguName: { type: String, trim: true },
    category: { type: String, required: true, index: true },
    categorySlug: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    unit: {
      type: String,
      required: true,
      enum: ['250g', '500g', '1kg', '1 piece', '1 dozen', '1 bunch', '1 packet'],
      default: '1kg'
    },
    availableStock: { type: Number, required: true, min: 0, default: 10 },
    images: [{ type: String, required: true }],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isDailyOffer: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 18 }
  },
  {
    timestamps: true,
    collection: 'products'
  }
);

// Compound index for search
ProductSchema.index({ name: 'text', description: 'text', teluguName: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
