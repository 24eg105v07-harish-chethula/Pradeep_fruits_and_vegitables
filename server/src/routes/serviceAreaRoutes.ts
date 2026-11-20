import { Router } from 'express';
import {
  getActiveServiceAreas,
  validateDeliveryZone,
  getAllServiceAreas,
  saveServiceArea,
  deleteServiceArea
} from '../controllers/serviceAreaController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = Router();

// Public routes for checkout and location selector
router.get('/active', getActiveServiceAreas);
router.post('/validate-zone', validateDeliveryZone);

// Admin routes
router.get('/', verifyAdminToken, getAllServiceAreas);
router.post('/', verifyAdminToken, saveServiceArea);
router.delete('/:id', verifyAdminToken, deleteServiceArea);

export default router;
