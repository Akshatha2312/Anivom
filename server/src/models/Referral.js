const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed',
    },
    rewardStatus: {
      type: String,
      enum: ['pending', 'earned'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
