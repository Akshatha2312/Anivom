const express = require('express');
const router = express.Router();
const {
  getCustomerDesigns,
  getAdminDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
} = require('../controllers/designController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminDesigns);
router.post('/admin', protect, authorize('admin'), createDesign);
router.patch('/admin/:id', protect, authorize('admin'), updateDesign);
router.delete('/admin/:id', protect, authorize('admin'), deleteDesign);

router.get('/', getCustomerDesigns);

module.exports = router;
