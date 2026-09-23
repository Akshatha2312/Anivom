const express = require('express');
const router = express.Router();
const {
  validateCustomerCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/validate', protect, validateCustomerCoupon);

router.get('/admin', protect, authorize('admin'), getAdminCoupons);
router.post('/admin', protect, authorize('admin'), createCoupon);
router.patch('/admin/:id', protect, authorize('admin'), updateCoupon);
router.delete('/admin/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
