const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createCustomization,
  getCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
} = require('../controllers/customizationController');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createCustomization)
  .get(getCustomizations);

router.route('/:id')
  .get(getCustomizationById)
  .patch(updateCustomization)
  .delete(deleteCustomization);

module.exports = router;
