import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrderItem } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { Coupon } from '../models/Coupon.js';
import { Payment } from '../models/Payment.js';
import { AuthRequest } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { notifyAdminNewOrder, notifyOrderStatusUpdate } from '../services/socketService.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

// Helper to generate unique order number like PFV-202611-1001
const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PFV-${dateStr}-${randomNum}`;
};

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Order storage is temporarily unavailable. Please try again after database connection is restored.' });
    }

    if (!req.user || req.user.role === 'admin' || req.user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'A valid customer account is required to place an order.' });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      deliveryAddress,
      paymentMethod,
      couponCode,
      deliveryInstructions
    } = req.body;

    if (!customerName || !customerPhone || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all required order details.' });
    }

    const cleanPincode = String(deliveryAddress.pincode).trim();

    // 1. Validate service area and pincode
    let serviceArea: any = null;
    if (isDBConnected()) {
      serviceArea = await ServiceArea.findOne({ pincode: cleanPincode, isActive: true });
    } else {
      serviceArea = memoryStore.serviceAreas.find(s => s.pincode === cleanPincode && s.isActive !== false);
    }

    if (!serviceArea) {
      return res.status(400).json({
        success: false,
        message: `We currently do not deliver to pincode ${cleanPincode}. PRADEEP FRUITS AND VEGETABLES delivers to Bhadradri Kothagudem and approved nearby service zones.`
      });
    }

    // 2. Validate and build order items & stock
    let subtotal = 0;
    const validatedItems: IOrderItem[] = [];

    for (const item of items) {
      let product: any = null;
      if (isDBConnected()) {
        product = await Product.findById(item.productId);
      } else {
        product = memoryStore.products.find(p => p._id === item.productId);
      }

      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.name}" is no longer available.` });
      }

      if (product.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.availableStock} items of "${product.name}" are in stock.`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        teluguName: product.teluguName,
        image: product.images ? product.images[0] : '/placeholder-produce.jpg',
        unit: item.selectedUnit || product.unit,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: item.quantity,
        totalPrice: itemTotal
      });
    }

    // Check minimum order
    if (subtotal < (serviceArea.minimumOrder || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for ${serviceArea.areaName} is ₹${serviceArea.minimumOrder}.`
      });
    }

    // 3. Delivery fee calculation
    let deliveryFee = serviceArea.deliveryCharge || 25;
    if (serviceArea.freeDeliveryThreshold && subtotal >= serviceArea.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    // 4. Coupon discount calculation
    let couponDiscount = 0;
    if (couponCode) {
      let coupon: any = null;
      if (isDBConnected()) {
        coupon = await Coupon.findOne({
          code: couponCode.toUpperCase().trim(),
          isActive: true,
          validUntil: { $gte: new Date() }
        });
      } else {
        coupon = memoryStore.coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.isActive !== false);
      }

      if (coupon && subtotal >= coupon.minOrderValue) {
        const calculatedDiscount = Math.round((subtotal * coupon.discountPercentage) / 100);
        couponDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - couponDiscount);
    const orderNumber = generateOrderNumber();
    const estimatedDeliveryMinutes = serviceArea.baseDeliveryMinutes || 30;

    // Handle Razorpay
    let razorpayOrderData = null;
    if (paymentMethod === 'Razorpay') {
      razorpayOrderData = await createRazorpayOrder(totalAmount, orderNumber);
    }

    const orderData: any = {
      orderId: orderNumber,
      userId: req.user?.id,
      customerName,
      customerPhone,
      customerEmail,
      items: validatedItems,
      subtotal,
      deliveryFee,
      couponDiscount,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Order Placed',
      deliveryAddress,
      estimatedDeliveryTime: estimatedDeliveryMinutes,
      estimatedDeliveryTimestamp: new Date(Date.now() + estimatedDeliveryMinutes * 60 * 1000).toISOString(),
      deliveryInstructions,
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Customer placed order.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (razorpayOrderData) {
      orderData.paymentDetails = { razorpayOrderId: razorpayOrderData.id };
    }

    let savedOrder: any = null;
    if (isDBConnected()) {
      const order = new Order(orderData);
      savedOrder = await order.save();

      // Deduct stock
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableStock: -item.quantity }
        });
      }

      // Record payment
      const payment = new Payment({
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderId,
        userId: req.user?.id,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod,
        paymentStatus: 'Pending',
        razorpayOrderId: razorpayOrderData?.id
      });
      await payment.save();
    } else {
      orderData._id = `ord_${Date.now()}`;
      savedOrder = orderData;
      memoryStore.orders.unshift(savedOrder);

      // Deduct memory stock
      for (const item of validatedItems) {
        const prod = memoryStore.products.find(p => p._id === item.productId);
        if (prod) {
          prod.availableStock = Math.max(0, prod.availableStock - item.quantity);
        }
      }
    }

    // Real-time broadcast to Admin Dashboard
    notifyAdminNewOrder(savedOrder);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder,
      razorpayOrder: razorpayOrderData
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Online Payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    let order: any = null;
    if (isDBConnected()) {
      order = await Order.findOne({ orderId });
    } else {
      order = memoryStore.orders.find(o => o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      order.paymentStatus = 'Failed';
      if (isDBConnected()) await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    order.paymentStatus = 'Paid';
    order.orderStatus = 'Order Confirmed';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    };
    order.statusHistory.push({
      status: 'Order Confirmed',
      timestamp: new Date().toISOString(),
      note: `Online payment of ₹${order.totalAmount} verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`
    });

    if (isDBConnected()) {
      await order.save();
      await Payment.findOneAndUpdate(
        { orderId: order._id },
        { paymentStatus: 'Paid', razorpayPaymentId, razorpaySignature }
      );
    }

    // Notify customer tracking room and admin dashboard
    notifyOrderStatusUpdate(order.orderId, order);

    return res.json({
      success: true,
      message: 'Payment verified successfully and order confirmed!',
      order
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get order tracking by ID or orderId
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const order = await Order.findOne({
        $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.json({ success: true, order });
    }

    const order = memoryStore.orders.find(o => o.orderId === id || o._id === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer orders
export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.query;

    if (isDBConnected()) {
      const query: any = {};
      if (userId) {
        query.$or = [{ userId }, { customerPhone: phone }];
      } else if (phone) {
        query.customerPhone = phone;
      } else {
        return res.status(400).json({ success: false, message: 'User or phone number required to find orders.' });
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    }

    let orders = memoryStore.orders;
    if (userId) {
      orders = orders.filter(o => o.userId === userId || o.customerPhone === phone);
    } else if (phone) {
      orders = orders.filter(o => o.customerPhone === phone);
    }
    return res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Customer cancel eligible order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let order: any = null;
    if (isDBConnected()) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = memoryStore.orders.find(o => o.orderId === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus !== 'Order Placed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already in "${order.orderStatus}" state.`
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: 'Cancelled by customer.'
    });

    // Restore stock
    for (const item of order.items) {
      if (isDBConnected()) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { availableStock: item.quantity } });
      } else {
        const prod = memoryStore.products.find(p => p._id === item.productId);
        if (prod) prod.availableStock += item.quantity;
      }
    }

    if (isDBConnected()) await order.save();
    notifyOrderStatusUpdate(order.orderId, order);

    return res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
