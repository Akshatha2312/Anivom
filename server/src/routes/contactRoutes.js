const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require('../controllers/contactController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many support messages sent from this IP, please try again after 15 minutes',
  },
});

router.post('/', contactLimiter, optionalAuth, createContactMessage);

router.get('/admin', protect, authorize('admin'), contactLimiter, getAllContactMessages);
router.patch('/admin/:id/status', protect, authorize('admin'), contactLimiter, updateContactMessageStatus);
router.delete('/admin/:id', protect, authorize('admin'), contactLimiter, deleteContactMessage);

module.exports = router;
