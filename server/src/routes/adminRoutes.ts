import { Router } from 'express';
import {
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getWhatsAppNotificationLink
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(verifyAdminToken);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);
router.get('/orders/:id/whatsapp', getWhatsAppNotificationLink);

export default router;
