const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  updateProductStatus,
  updateVariantStock,
} = require('../controllers/productController');

const router = express.Router();

router.post('/admin', protect, authorize('admin'), createProduct);
router.get('/admin', protect, authorize('admin'), getAdminProducts);
router.get('/admin/:id', protect, authorize('admin'), getAdminProductById);
router.patch('/admin/:id/status', protect, authorize('admin'), updateProductStatus);
router.patch('/admin/:id/variants/:variantId/stock', protect, authorize('admin'), updateVariantStock);
router.patch('/admin/:id', protect, authorize('admin'), updateProduct);

router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
