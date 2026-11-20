import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { AuthRequest } from '../middleware/auth.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;
const JWT_SECRET = process.env.JWT_SECRET || 'pradeep_fruits_and_vegetables_jwt_secret_key_2026_kothagudem';

// Register Customer
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile number, and password are required.' });
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    if (isDBConnected()) {
      const existingUser = await User.findOne({ mobile: cleanMobile });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered. Please login.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        mobile: cleanMobile,
        email: email ? email.toLowerCase().trim() : undefined,
        password: hashedPassword,
        role: 'customer',
        addresses: []
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role, mobile: user.mobile },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to PRADEEP FRUITS AND VEGETABLES.',
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    // In-Memory registration
    const existing = memoryStore.users.find(u => u.mobile === cleanMobile);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered. Please login.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      mobile: cleanMobile,
      email: email ? email.toLowerCase().trim() : undefined,
      password: hashedPassword,
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, mobile: newUser.mobile },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to PRADEEP FRUITS AND VEGETABLES.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

// Login Customer
export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (isDBConnected()) {
      const user = await User.findOne({ mobile: cleanMobile });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password!);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, mobile: user.mobile },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    // In-memory customer login
    let user = memoryStore.users.find(u => u.mobile === cleanMobile);
    if (!user) {
      // Auto-create test demo customer if logging in with test credentials
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = {
        _id: `usr_${Date.now()}`,
        name: 'Guest Customer',
        mobile: cleanMobile,
        password: hashedPassword,
        role: 'customer',
        addresses: [
          {
            _id: 'addr_1',
            houseNo: '5-12/A',
            street: 'Main Road',
            area: 'Writer Basti',
            town: 'Kothagudem',
            district: 'Bhadradri Kothagudem',
            state: 'Telangana',
            pincode: '507101',
            recipientName: 'Customer',
            customerMobile: cleanMobile,
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      };
      memoryStore.users.push(user);
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

// Customer Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (isDBConnected()) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, user });
    }

    const user = memoryStore.users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: { ...user, password: undefined } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Save / Add Address
export const saveAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { houseNo, street, area, town, district, state, pincode, landmark, recipientName, customerMobile, isDefault } = req.body;

    if (!houseNo || !street || !area || !pincode || !recipientName || !customerMobile) {
      return res.status(400).json({ success: false, message: 'Please fill all mandatory address fields.' });
    }

    if (isDBConnected()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (isDefault) {
        user.addresses.forEach(a => { a.isDefault = false; });
      }

      user.addresses.push({
        houseNo,
        street,
        area,
        town: town || 'Kothagudem',
        district: district || 'Bhadradri Kothagudem',
        state: state || 'Telangana',
        pincode,
        landmark,
        recipientName,
        customerMobile,
        isDefault: isDefault || user.addresses.length === 0
      });

      await user.save();
      return res.json({ success: true, message: 'Address saved successfully.', addresses: user.addresses });
    }

    const user = memoryStore.users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (isDefault) {
      user.addresses.forEach((a: any) => { a.isDefault = false; });
    }

    const newAddr = {
      _id: `addr_${Date.now()}`,
      houseNo,
      street,
      area,
      town: town || 'Kothagudem',
      district: district || 'Bhadradri Kothagudem',
      state: state || 'Telangana',
      pincode,
      landmark,
      recipientName,
      customerMobile,
      isDefault: isDefault || user.addresses.length === 0
    };
    user.addresses.push(newAddr);

    return res.json({ success: true, message: 'Address saved successfully.', addresses: user.addresses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (isDBConnected()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
      await user.save();
      return res.json({ success: true, message: 'Address removed.', addresses: user.addresses });
    }

    const user = memoryStore.users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.addresses = user.addresses.filter((a: any) => a._id !== addressId);
    return res.json({ success: true, message: 'Address removed.', addresses: user.addresses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const cleanUsername = username.toLowerCase().trim();

    if (isDBConnected()) {
      const admin = await Admin.findOne({
        $or: [
          { username: cleanUsername },
          { email: cleanUsername }
        ]
      });

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwt.sign(
        { id: admin._id, username: admin.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Admin authenticated successfully.',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          email: admin.email,
          mobile: admin.mobile
        }
      });
    }

    // In-memory admin authentication: Default credentials "admin" / "AdminPassword123!"
    if (
      (cleanUsername === 'admin' || cleanUsername === 'admin@pradeepvegetables.com') &&
      password === 'AdminPassword123!'
    ) {
      const token = jwt.sign(
        { id: 'admin_1', username: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Admin authenticated successfully.',
        token,
        admin: {
          id: 'admin_1',
          username: 'admin',
          name: 'Pradeep - Store Owner',
          role: 'superadmin',
          email: 'admin@pradeepvegetables.com',
          mobile: '9704532104'
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
