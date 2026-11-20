import { Router } from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = Router();

// Public validation for cart/checkout
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', verifyAdminToken, getAllCoupons);
router.post('/', verifyAdminToken, createCoupon);
router.delete('/:id', verifyAdminToken, deleteCoupon);

export default router;
