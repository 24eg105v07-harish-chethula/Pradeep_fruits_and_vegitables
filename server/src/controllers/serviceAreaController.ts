import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ServiceArea } from '../models/ServiceArea.js';
import { Order } from '../models/Order.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

// Get all active delivery areas for customer address selector & checkout
export const getActiveServiceAreas = async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const areas = await ServiceArea.find({ isActive: true }).sort({ areaName: 1 });
      return res.json({ success: true, areas });
    }
    const areas = memoryStore.serviceAreas.filter(a => a.isActive !== false);
    return res.json({ success: true, areas });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Validate a specific pincode & calculate dynamic delivery estimate
export const validateDeliveryZone = async (req: Request, res: Response) => {
  try {
    const { pincode, areaName } = req.body;

    if (!pincode) {
      return res.status(400).json({ success: false, message: 'Pincode is required.' });
    }

    const cleanPincode = String(pincode).trim();
    let area: any = null;

    if (isDBConnected()) {
      const query: any = { pincode: cleanPincode, isActive: true };
      if (areaName) {
        query.areaName = new RegExp(`^${areaName.trim()}$`, 'i');
      }
      area = await ServiceArea.findOne(query);
      if (!area) {
        area = await ServiceArea.findOne({ pincode: cleanPincode, isActive: true });
      }
    } else {
      area = memoryStore.serviceAreas.find(a => a.pincode === cleanPincode && a.isActive !== false);
    }

    if (!area) {
      return res.status(400).json({
        success: false,
        deliverable: false,
        message: `Currently, we do not deliver to pincode ${cleanPincode}. We serve approved locations in Bhadradri Kothagudem.`
      });
    }

    // Dynamic Delivery Time Calculation based on current workload
    let activeOrdersCount = 0;
    if (isDBConnected()) {
      activeOrdersCount = await Order.countDocuments({
        orderStatus: { $in: ['Order Placed', 'Order Confirmed', 'Preparing'] }
      });
    } else {
      activeOrdersCount = memoryStore.orders.filter(o =>
        ['Order Placed', 'Order Confirmed', 'Preparing'].includes(o.orderStatus)
      ).length;
    }

    let estimatedMinutes = area.baseDeliveryMinutes || 30;
    let workloadNote = 'Standard 30-minute express delivery';

    if (activeOrdersCount > 10) {
      estimatedMinutes += 20;
      workloadNote = 'High order volume in Bhadradri Kothagudem. Delivery may take slightly longer.';
    } else if (activeOrdersCount > 5) {
      estimatedMinutes += 10;
      workloadNote = 'Moderate order rush. Delivering as quickly as possible.';
    }

    return res.json({
      success: true,
      deliverable: true,
      serviceArea: area,
      estimatedMinutes,
      workloadNote,
      activeOrdersCount,
      minimumOrder: area.minimumOrder,
      deliveryCharge: area.deliveryCharge,
      freeDeliveryThreshold: area.freeDeliveryThreshold
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all service areas
export const getAllServiceAreas = async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const areas = await ServiceArea.find().sort({ areaName: 1 });
      return res.json({ success: true, areas });
    }
    return res.json({ success: true, areas: memoryStore.serviceAreas });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Add or update service area
export const saveServiceArea = async (req: Request, res: Response) => {
  try {
    const { _id, areaName, town, district, state, pincode, isActive, baseDeliveryMinutes, minimumOrder, deliveryCharge, freeDeliveryThreshold } = req.body;

    if (!areaName || !pincode) {
      return res.status(400).json({ success: false, message: 'Area name and pincode are required.' });
    }

    if (isDBConnected()) {
      let area;
      if (_id) {
        area = await ServiceArea.findByIdAndUpdate(
          _id,
          {
            areaName,
            town: town || 'Kothagudem',
            district: district || 'Bhadradri Kothagudem',
            state: state || 'Telangana',
            pincode,
            isActive: isActive !== undefined ? isActive : true,
            baseDeliveryMinutes: Number(baseDeliveryMinutes || 30),
            minimumOrder: Number(minimumOrder || 99),
            deliveryCharge: Number(deliveryCharge || 25),
            freeDeliveryThreshold: Number(freeDeliveryThreshold || 299)
          },
          { new: true }
        );
      } else {
        area = new ServiceArea({
          areaName,
          town: town || 'Kothagudem',
          district: district || 'Bhadradri Kothagudem',
          state: state || 'Telangana',
          pincode,
          isActive: isActive !== undefined ? isActive : true,
          baseDeliveryMinutes: Number(baseDeliveryMinutes || 30),
          minimumOrder: Number(minimumOrder || 99),
          deliveryCharge: Number(deliveryCharge || 25),
          freeDeliveryThreshold: Number(freeDeliveryThreshold || 299)
        });
        await area.save();
      }
      return res.json({ success: true, message: 'Service area saved successfully.', area });
    }

    if (_id) {
      const idx = memoryStore.serviceAreas.findIndex(a => a._id === _id);
      if (idx !== -1) {
        memoryStore.serviceAreas[idx] = {
          ...memoryStore.serviceAreas[idx],
          areaName,
          town: town || 'Kothagudem',
          district: district || 'Bhadradri Kothagudem',
          state: state || 'Telangana',
          pincode,
          isActive: isActive !== undefined ? isActive : true,
          baseDeliveryMinutes: Number(baseDeliveryMinutes || 30),
          minimumOrder: Number(minimumOrder || 99),
          deliveryCharge: Number(deliveryCharge || 25),
          freeDeliveryThreshold: Number(freeDeliveryThreshold || 299)
        };
        return res.json({ success: true, message: 'Service area updated successfully.', area: memoryStore.serviceAreas[idx] });
      }
    }

    const newArea = {
      _id: `sa_${Date.now()}`,
      areaName,
      town: town || 'Kothagudem',
      district: district || 'Bhadradri Kothagudem',
      state: state || 'Telangana',
      pincode,
      isActive: isActive !== undefined ? isActive : true,
      baseDeliveryMinutes: Number(baseDeliveryMinutes || 30),
      minimumOrder: Number(minimumOrder || 99),
      deliveryCharge: Number(deliveryCharge || 25),
      freeDeliveryThreshold: Number(freeDeliveryThreshold || 299)
    };
    memoryStore.serviceAreas.push(newArea);

    return res.json({ success: true, message: 'Service area saved successfully.', area: newArea });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete service area
export const deleteServiceArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      await ServiceArea.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Service area removed successfully.' });
    }

    memoryStore.serviceAreas = memoryStore.serviceAreas.filter(a => a._id !== id);
    return res.json({ success: true, message: 'Service area removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
