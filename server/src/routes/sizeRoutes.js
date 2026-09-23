const express = require('express');
const router = express.Router();
const {
  getCustomerSizes,
  getAdminSizes,
  createSize,
  updateSize,
  deleteSize,
} = require('../controllers/sizeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminSizes);
router.post('/admin', protect, authorize('admin'), createSize);
router.patch('/admin/:id', protect, authorize('admin'), updateSize);
router.delete('/admin/:id', protect, authorize('admin'), deleteSize);

router.get('/', getCustomerSizes);

module.exports = router;
