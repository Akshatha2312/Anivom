const express = require('express');
const router = express.Router();
const {
  getCustomerCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminCategories);
router.post('/admin', protect, authorize('admin'), createCategory);
router.patch('/admin/:id', protect, authorize('admin'), updateCategory);
router.delete('/admin/:id', protect, authorize('admin'), deleteCategory);

router.get('/', getCustomerCategories);

module.exports = router;
