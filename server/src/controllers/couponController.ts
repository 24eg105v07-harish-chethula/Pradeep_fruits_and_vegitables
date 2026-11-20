import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

// Validate coupon for checkout
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.toUpperCase().trim();
    let coupon: any = null;

    if (isDBConnected()) {
      coupon = await Coupon.findOne({
        code: cleanCode,
        isActive: true,
        validUntil: { $gte: new Date() }
      });
    } else {
      coupon = memoryStore.coupons.find(c => c.code === cleanCode && c.isActive !== false);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrderValue}.`
      });
    }

    const calculatedDiscount = Math.round((cartTotal * coupon.discountPercentage) / 100);
    const finalDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${finalDiscount}.`,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: finalDiscount,
        description: coupon.description
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all coupons
export const getAllCoupons = async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json({ success: true, coupons });
    }
    return res.json({ success: true, coupons: memoryStore.coupons });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create coupon
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, description, discountPercentage, minOrderValue, maxDiscountAmount, validUntil } = req.body;

    if (!code || !discountPercentage || !maxDiscountAmount || !validUntil) {
      return res.status(400).json({ success: false, message: 'Missing required coupon fields.' });
    }

    const cleanCode = code.toUpperCase().trim();

    if (isDBConnected()) {
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
      }

      const coupon = new Coupon({
        code: cleanCode,
        description: description || `${discountPercentage}% OFF up to ₹${maxDiscountAmount}`,
        discountPercentage: Number(discountPercentage),
        minOrderValue: Number(minOrderValue || 0),
        maxDiscountAmount: Number(maxDiscountAmount),
        validUntil: new Date(validUntil),
        isActive: true
      });

      await coupon.save();
      return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
    }

    const existing = memoryStore.coupons.find(c => c.code === cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const newCoupon = {
      _id: `cp_${Date.now()}`,
      code: cleanCode,
      description: description || `${discountPercentage}% OFF up to ₹${maxDiscountAmount}`,
      discountPercentage: Number(discountPercentage),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscountAmount: Number(maxDiscountAmount),
      validUntil,
      isActive: true
    };
    memoryStore.coupons.push(newCoupon);

    return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon: newCoupon });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      await Coupon.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Coupon removed successfully.' });
    }

    memoryStore.coupons = memoryStore.coupons.filter(c => c._id !== id);
    return res.json({ success: true, message: 'Coupon removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
