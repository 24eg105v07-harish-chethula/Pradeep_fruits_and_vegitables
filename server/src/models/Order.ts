import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  teluguName?: string;
  image: string;
  unit: string;
  price: number;
  originalPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'Razorpay';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  orderStatus: OrderStatus;
  deliveryAddress: {
    houseNo: string;
    street: string;
    area: string;
    town: string;
    district: string;
    state: string;
    pincode: string;
    landmark?: string;
    customerMobile: string;
    recipientName: string;
  };
  estimatedDeliveryTime: number; // minutes
  estimatedDeliveryTimestamp?: Date;
  deliveryInstructions?: string;
  adminNotes?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    teluguName: { type: String },
    image: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, trim: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'Razorpay'], required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Order Confirmed',
        'Preparing',
        'Packed',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
      ],
      default: 'Order Placed',
      index: true
    },
    deliveryAddress: {
      houseNo: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      town: { type: String, required: true, default: 'Kothagudem' },
      district: { type: String, required: true, default: 'Bhadradri Kothagudem' },
      state: { type: String, required: true, default: 'Telangana' },
      pincode: { type: String, required: true },
      landmark: { type: String },
      customerMobile: { type: String, required: true },
      recipientName: { type: String, required: true }
    },
    estimatedDeliveryTime: { type: Number, default: 30 },
    estimatedDeliveryTimestamp: { type: Date },
    deliveryInstructions: { type: String },
    adminNotes: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'orders'
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
