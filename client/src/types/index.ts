export type ProductUnit = '250g' | '500g' | '1kg' | '1 piece' | '1 dozen' | '1 bunch' | '1 packet';

export interface Product {
  _id: string;
  name: string;
  teluguName?: string;
  category: string; // e.g. "Fresh Vegetables", "Fresh Fruits"
  categorySlug?: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number; // in percent
  unit: ProductUnit;
  availableStock: number;
  images: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isDailyOffer?: boolean;
  isOrganic?: boolean;
  isSeasonal?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconName: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit: ProductUnit;
  unitPrice: number;
}

export interface Address {
  _id?: string;
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
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD' | 'Razorpay';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  teluguName?: string;
  image: string;
  unit: string;
  price: number;
  originalPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderId: string; // formatted ID e.g. "PFV-202611-1001"
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  orderStatus: OrderStatus;
  deliveryAddress: Address;
  estimatedDeliveryTime: number; // in minutes (default 30)
  estimatedDeliveryTimestamp?: string;
  deliveryInstructions?: string;
  adminNotes?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountPercentage: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  isActive: boolean;
  validUntil: string;
}

export interface ServiceArea {
  _id?: string;
  areaName: string;
  town: string;
  pincode: string;
  district: string;
  state: string;
  isActive: boolean;
  estimatedMinutes: number;
  minimumOrder: number;
  deliveryCharge: number;
  freeDeliveryThreshold?: number;
}

export interface CustomerUser {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  addresses: Address[];
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface AdminStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  lowStockCount: number;
}
