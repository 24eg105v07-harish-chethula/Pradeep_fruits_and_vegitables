import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'COD' | 'Razorpay';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  errorDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, enum: ['COD', 'Razorpay'], required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    errorDetails: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    collection: 'payments'
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
