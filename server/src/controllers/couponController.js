const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const validateCouponForSubtotal = (coupon, subtotal) => {
  const now = new Date();

  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }

  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, message: 'Coupon is not active yet' };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minimumOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscountAmount > 0 && discountAmount > coupon.maximumDiscountAmount) {
      discountAmount = coupon.maximumDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    discountAmount,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    couponId: coupon._id,
  };
};

const validateCustomerCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.query;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code',
      });
    }

    let subtotalNum = Number(subtotal);
    if (!subtotalNum || isNaN(subtotalNum) || subtotalNum <= 0) {
      if (req.user) {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (cart && cart.items && cart.items.length > 0) {
          subtotalNum = cart.items.reduce((acc, item) => {
            const p = item.product;
            const price = p ? p.basePrice : 0;
            return acc + price * item.quantity;
          }, 0);
        }
      }
    }
    subtotalNum = subtotalNum || 0;

    const validation = validateCouponForSubtotal(coupon, subtotalNum);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      data: {
        code: validation.code,
        discountType: validation.discountType,
        discountValue: validation.discountValue,
        discountAmount: validation.discountAmount,
        payableAmount: Math.max(0, subtotalNum - validation.discountAmount),
        subtotal: subtotalNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: coupons.length,
      data: {
        coupons,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists` });
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'Discount type must be percentage or fixed' });
    }

    const valNum = Number(discountValue);
    if (isNaN(valNum) || valNum <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be greater than 0' });
    }

    if (discountType === 'percentage' && valNum > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%' });
    }

    const minOrder = Number(minimumOrderAmount) || 0;
    if (minOrder < 0) {
      return res.status(400).json({ success: false, message: 'Minimum order amount cannot be negative' });
    }

    const maxDisc = Number(maximumDiscountAmount) || 0;
    if (maxDisc < 0) {
      return res.status(400).json({ success: false, message: 'Maximum discount amount cannot be negative' });
    }

    const limit = Number(usageLimit) || 0;
    if (limit < 0) {
      return res.status(400).json({ success: false, message: 'Usage limit cannot be negative' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : null;

    if (end && end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: valNum,
      minimumOrderAmount: minOrder,
      maximumDiscountAmount: maxDisc,
      startDate: start,
      endDate: end,
      usageLimit: limit,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const allowed = [
      'code',
      'discountType',
      'discountValue',
      'minimumOrderAmount',
      'maximumDiscountAmount',
      'startDate',
      'endDate',
      'usageLimit',
      'isActive',
    ];

    const updates = {};
    Object.keys(req.body).forEach((k) => {
      if (allowed.includes(k)) updates[k] = req.body[k];
    });

    if (updates.code) {
      const cleanCode = updates.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ _id: { $ne: id }, code: cleanCode });
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" is already taken` });
      }
      updates.code = cleanCode;
    }

    const type = updates.discountType || coupon.discountType;
    const val = updates.discountValue !== undefined ? Number(updates.discountValue) : coupon.discountValue;

    if (val <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be greater than 0' });
    }

    if (type === 'percentage' && val > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%' });
    }

    if (updates.minimumOrderAmount !== undefined && Number(updates.minimumOrderAmount) < 0) {
      return res.status(400).json({ success: false, message: 'Minimum order amount cannot be negative' });
    }

    if (updates.maximumDiscountAmount !== undefined && Number(updates.maximumDiscountAmount) < 0) {
      return res.status(400).json({ success: false, message: 'Maximum discount amount cannot be negative' });
    }

    if (updates.usageLimit !== undefined && Number(updates.usageLimit) < 0) {
      return res.status(400).json({ success: false, message: 'Usage limit cannot be negative' });
    }

    const newStart = updates.startDate ? new Date(updates.startDate) : coupon.startDate;
    const newEnd = updates.endDate !== undefined ? (updates.endDate ? new Date(updates.endDate) : null) : coupon.endDate;

    if (newEnd && newStart && newEnd <= newStart) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    Object.assign(coupon, updates);
    const updatedCoupon = await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: {
        coupon: updatedCoupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCouponForSubtotal,
  validateCustomerCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
