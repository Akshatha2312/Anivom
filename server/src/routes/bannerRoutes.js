const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

const router = express.Router();

router.get('/', getPublicBanners);

router.get('/admin', protect, authorize('admin'), getAdminBanners);
router.post('/admin', protect, authorize('admin'), createBanner);
router.patch('/admin/:id', protect, authorize('admin'), updateBanner);
router.delete('/admin/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
