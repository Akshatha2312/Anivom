const Referral = require('../models/Referral');
const User = require('../models/User');

const getMyReferrals = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.referralCode) {
      await user.save();
    }

    const referrals = await Referral.find({ referrer: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const total = referrals.length;
    const successful = referrals.filter((r) => r.status === 'completed').length;
    const pending = referrals.filter((r) => r.status === 'pending').length;

    let rewardStatus = 'No Referrals Yet';
    if (total > 0) {
      const hasEarned = referrals.some((r) => r.rewardStatus === 'earned');
      rewardStatus = hasEarned ? 'Reward Earned' : 'Reward Pending';
    }

    const history = referrals.map((r, index) => {
      const isCompleted = r.status === 'completed';
      const isEarned = r.rewardStatus === 'earned';

      return {
        _id: r._id,
        label: `Referral #${total - index}`,
        status: isCompleted ? 'Completed' : 'Pending',
        rewardStatus: isEarned ? 'Reward Earned' : 'Reward Pending',
        date: r.createdAt,
      };
    });

    const clientOrigin = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')[0].trim().replace(/\/+$/, '')
      : (req.headers.origin || 'http://localhost:5173');

    const referralLink = `${clientOrigin}/register?ref=${user.referralCode}`;

    res.status(200).json({
      status: 'success',
      data: {
        referralCode: user.referralCode,
        referralLink,
        stats: {
          total,
          successful,
          pending,
          rewardStatus,
        },
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

const validateReferralCode = async (req, res, next) => {
  try {
    const rawCode = req.params.code || req.query.code || '';
    const cleanCode = rawCode.trim().toUpperCase();

    if (!cleanCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Referral code is required',
      });
    }

    const referrer = await User.findOne({ referralCode: cleanCode }).select('_id name referralCode');

    if (!referrer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid or non-existent referral code',
        data: { valid: false },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        referralCode: referrer.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyReferrals,
  validateReferralCode,
};
