const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  getAdminStats,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelCustomerOrder,
  requestOrderReturn,
  processAdminReturnRequest,
  processAdminRefund,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/admin', authorize('admin'), getAdminOrders);
router.get('/admin/:id', authorize('admin'), getAdminOrderById);
router.patch('/admin/:id/status', authorize('admin'), updateAdminOrderStatus);
router.patch('/admin/:id/return', authorize('admin'), processAdminReturnRequest);
router.patch('/admin/:id/refund', authorize('admin'), processAdminRefund);

router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelCustomerOrder);
router.patch('/:id/return', requestOrderReturn);

module.exports = router;

