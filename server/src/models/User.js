const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.isNew && !this.referralCode) {
    const crypto = require('crypto');
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const candidate = `ANIVOM${randomHex}`;
      const existing = await this.constructor.findOne({ referralCode: candidate });
      if (!existing) {
        this.referralCode = candidate;
        isUnique = true;
      }
    }
    if (!isUnique) {
      this.referralCode = `ANIVOM${Date.now().toString(36).toUpperCase()}`;
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
