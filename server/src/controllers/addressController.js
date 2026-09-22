const mongoose = require('mongoose');
const Address = require('../models/Address');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: {
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
    } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Full name is required' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Phone number is required' });
    }

    if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Address line 1 is required' });
    }

    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'City is required' });
    }

    if (!state || typeof state !== 'string' || state.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'State is required' });
    }

    if (!postalCode || typeof postalCode !== 'string' || postalCode.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Postal code is required' });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = existingCount === 0 ? true : Boolean(isDefault);

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : '',
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country ? country.trim() : 'India',
      label: label || 'Home',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      status: 'success',
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid address ID' });
    }

    let address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this address' });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = phone.trim();
    if (addressLine1) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (postalCode) address.postalCode = postalCode.trim();
    if (country) address.country = country.trim();
    if (label) address.label = label;
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

    await address.save();

    res.status(200).json({
      status: 'success',
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid address ID' });
    }

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to delete this address' });
    }

    const wasDefault = address.isDefault;
    await Address.deleteOne({ _id: id });

    if (wasDefault) {
      const firstRemaining = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (firstRemaining) {
        firstRemaining.isDefault = true;
        await firstRemaining.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid address ID' });
    }

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this address' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      status: 'success',
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
