const express = require('express');
const router = express.Router();
const {
  getCustomerColours,
  getAdminColours,
  createColour,
  updateColour,
  deleteColour,
} = require('../controllers/colourController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminColours);
router.post('/admin', protect, authorize('admin'), createColour);
router.patch('/admin/:id', protect, authorize('admin'), updateColour);
router.delete('/admin/:id', protect, authorize('admin'), deleteColour);

router.get('/', getCustomerColours);

module.exports = router;
