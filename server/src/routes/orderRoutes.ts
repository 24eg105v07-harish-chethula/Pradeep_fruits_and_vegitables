import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  trackOrder,
  getCustomerOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { verifyCustomerToken } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyCustomerToken, createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/track/:id', trackOrder);
router.get('/my-orders', verifyCustomerToken, getCustomerOrders);
router.post('/cancel/:id', cancelOrder);

export default router;
