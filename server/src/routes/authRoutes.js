const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/me', protect, getCurrentUser);

module.exports = router;
