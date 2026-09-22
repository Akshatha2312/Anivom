const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(createAddress);

router.route('/:id')
  .patch(updateAddress)
  .delete(deleteAddress);

router.route('/:id/default')
  .patch(setDefaultAddress);

module.exports = router;
