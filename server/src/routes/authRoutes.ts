import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  saveAddress,
  deleteAddress,
  adminLogin
} from '../controllers/authController.js';
import { verifyCustomerToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/profile', verifyCustomerToken, getProfile);
router.post('/addresses', verifyCustomerToken, saveAddress);
router.delete('/addresses/:addressId', verifyCustomerToken, deleteAddress);

// Admin login route
router.post('/admin/login', adminLogin);

export default router;
