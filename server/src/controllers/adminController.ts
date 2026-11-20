import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { notifyOrderStatusUpdate } from '../services/socketService.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

// Get Admin Dashboard Overview Metrics
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Admin statistics are unavailable because MongoDB is not connected.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers,
      lowStockProducts,
      revenueResult
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Order Confirmed', 'Preparing', 'Packed', 'Out for Delivery'] } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      User.countDocuments({ role: 'customer' }),
      Product.find({ availableStock: { $lte: 5 }, isActive: true }).select('name unit availableStock images price'),
      Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length ? revenueResult[0].totalRevenue : 0;

    return res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers,
        totalRevenue,
        lowStockCount: lowStockProducts.length,
        lowStockProducts
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders with search, filter, pagination
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, search, date, limit = 50, page = 1 } = req.query;

    if (isDBConnected()) {
      const filter: any = {};

      if (status && status !== 'all') {
        filter.orderStatus = status;
      }

      if (search) {
        const searchRegex = new RegExp(String(search), 'i');
        filter.$or = [
          { orderId: searchRegex },
          { customerName: searchRegex },
          { customerPhone: searchRegex },
          { 'deliveryAddress.area': searchRegex },
          { 'deliveryAddress.pincode': searchRegex }
        ];
      }

      if (date) {
        const selectedDate = new Date(String(date));
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        filter.createdAt = { $gte: selectedDate, $lt: nextDate };
      }

      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      return res.json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        orders
      });
    }

    // MongoDB is the only order source of truth. Do not return memory-only or demo orders.
    return res.status(503).json({ success: false, message: 'Orders are unavailable because MongoDB is not connected.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update order status & delivery progress
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, estimatedDeliveryTime, adminNotes, note } = req.body;

    const validStatuses: OrderStatus[] = [
      'Order Placed',
      'Order Confirmed',
      'Preparing',
      'Packed',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    let order: any = null;

    if (isDBConnected()) {
      order = await Order.findOne({
        $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
    } else {
      order = memoryStore.orders.find(o => o.orderId === id || o._id === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;

    if (status) {
      if (!validStatuses.includes(status as OrderStatus)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
      }

      if (order.orderStatus === status) {
        return res.json({ success: true, message: `Order #${order.orderId} is already "${status}".`, order });
      }

      order.orderStatus = status as OrderStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: status as OrderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Admin updated order status to ${status}`
      });

      // If moving to delivered and was COD, mark payment as Paid
      if (status === 'Delivered' && order.paymentMethod === 'COD') {
        order.paymentStatus = 'Paid';
      }

      // If cancelled by admin, restore product stock
      if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
        for (const item of order.items) {
          if (isDBConnected()) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { availableStock: item.quantity } });
          } else {
            const prod = memoryStore.products.find(p => p._id === item.productId);
            if (prod) prod.availableStock += item.quantity;
          }
        }
      }
    }

    if (estimatedDeliveryTime !== undefined) {
      order.estimatedDeliveryTime = Number(estimatedDeliveryTime);
      order.estimatedDeliveryTimestamp = new Date(Date.now() + Number(estimatedDeliveryTime) * 60 * 1000).toISOString();
    }

    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    order.updatedAt = new Date().toISOString();

    if (isDBConnected()) {
      await order.save();
    }

    // Broadcast update via Socket.IO
    notifyOrderStatusUpdate(order.orderId, order);

    return res.json({
      success: true,
      message: `Order #${order.orderId} status updated to "${order.orderStatus}".`,
      order
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get customer list
export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const customers = await User.find({ role: 'customer' })
        .select('-password')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: customers.length, customers });
    }

    return res.json({
      success: true,
      count: memoryStore.users.length,
      customers: memoryStore.users.map(u => ({ ...u, password: undefined }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Generate WhatsApp notification link
export const getWhatsAppNotificationLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let order: any = null;
    if (isDBConnected()) {
      order = await Order.findOne({
        $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
    } else {
      order = memoryStore.orders.find(o => o.orderId === id || o._id === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const phone = order.customerPhone.replace(/\D/g, '').slice(-10);
    const intlPhone = `91${phone}`;

    let msg = `Hello ${order.customerName},\nYour order *${order.orderId}* with *PRADEEP FRUITS AND VEGETABLES* has been updated!\n\nStatus: *${order.orderStatus}*\nEstimated Delivery: *${order.estimatedDeliveryTime} mins*\nTotal Amount: ₹${order.totalAmount}\nDelivery Area: ${order.deliveryAddress.area}, Bhadradri Kothagudem.\n\nThank you for choosing fresh & healthy produce!`;

    const encoded = encodeURIComponent(msg);
    const waLink = `https://wa.me/${intlPhone}?text=${encoded}`;

    return res.json({ success: true, waLink, messageText: msg });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
