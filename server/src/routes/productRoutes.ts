import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/productController.js';
import { verifyAdminToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', verifyAdminToken, createProduct);
router.put('/:id', verifyAdminToken, updateProduct);
router.delete('/:id', verifyAdminToken, deleteProduct);
router.patch('/:id/stock', verifyAdminToken, updateStock);

// Image upload route
router.post('/upload', verifyAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, imageUrl });
});

export default router;
