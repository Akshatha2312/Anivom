const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyReferrals, validateReferralCode } = require('../controllers/referralController');

const router = express.Router();

router.get('/me', protect, getMyReferrals);
router.get('/validate/:code', validateReferralCode);

module.exports = router;
