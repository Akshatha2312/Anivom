const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentUser,
  getAdminUsers,
  googleAuth,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/google', googleAuth);
router.post('/logout', logoutCustomer);
router.get('/me', protect, getCurrentUser);
router.get('/users/admin', protect, authorize('admin'), getAdminUsers);

module.exports = router;

