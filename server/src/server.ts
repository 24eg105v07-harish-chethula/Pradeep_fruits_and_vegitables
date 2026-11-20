import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import serviceAreaRoutes from './routes/serviceAreaRoutes.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO
initSocket(server, CLIENT_URL);

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    business: 'PRADEEP FRUITS AND VEGETABLES',
    location: 'Bhadradri Kothagudem, Telangana, India',
    deliveryTarget: '30 minutes',
    currency: 'INR (₹)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/service-areas', serviceAreaRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server immediately and connect to DB asynchronously
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🥑 PRADEEP FRUITS AND VEGETABLES - Backend Active`);
    console.log(`📍 Bhadradri Kothagudem, Telangana, India`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`⚡ Target Delivery: 30 Minutes | Currency: INR (₹)`);
    console.log(`=======================================================`);
  });

  // Attempt MongoDB connection in background
  connectDB();
};

startServer();
