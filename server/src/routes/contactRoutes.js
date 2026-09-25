const express = require('express');
const router = express.Router();
const {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require('../controllers/contactController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createContactMessage);

router.get('/admin', protect, authorize('admin'), getAllContactMessages);
router.patch('/admin/:id/status', protect, authorize('admin'), updateContactMessageStatus);
router.delete('/admin/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
