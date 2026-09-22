const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  validateCheckoutSummary,
} = require('../controllers/cartController');

const router = express.Router();

router.use(protect);

router.route('/checkout-summary')
  .post(validateCheckoutSummary);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .patch(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;

