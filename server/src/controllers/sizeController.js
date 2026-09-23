const mongoose = require('mongoose');
const Size = require('../models/Size');
const Product = require('../models/Product');

const getCustomerSizes = async (req, res, next) => {
  try {
    const sizes = await Size.find({ isActive: true }).sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      results: sizes.length,
      data: {
        sizes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminSizes = async (req, res, next) => {
  try {
    const sizes = await Size.find().sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      results: sizes.length,
      data: {
        sizes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createSize = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Size name is required',
      });
    }

    const trimmedName = name.trim();

    const existing = await Size.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: `Size "${trimmedName}" already exists`,
      });
    }

    const size = await Size.create({
      name: trimmedName,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Size created successfully',
      data: {
        size,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSize = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid size ID',
      });
    }

    const size = await Size.findById(id);
    if (!size) {
      return res.status(404).json({
        status: 'fail',
        message: 'Size not found',
      });
    }

    const { name, isActive } = req.body;
    const updates = {};

    if (name && typeof name === 'string' && name.trim() !== '') {
      const trimmedName = name.trim();

      const existing = await Size.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      if (existing) {
        return res.status(400).json({
          status: 'fail',
          message: `Size name "${trimmedName}" is already taken`,
        });
      }

      if (size.name !== trimmedName) {
        await Product.updateMany(
          { 'variants.size': size.name },
          { $set: { 'variants.$[elem].size': trimmedName } },
          { arrayFilters: [{ 'elem.size': size.name }] }
        );
      }

      updates.name = trimmedName;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updatedSize = await Size.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Size updated successfully',
      data: {
        size: updatedSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSize = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid size ID',
      });
    }

    const size = await Size.findById(id);
    if (!size) {
      return res.status(404).json({
        status: 'fail',
        message: 'Size not found',
      });
    }

    const usedCount = await Product.countDocuments({ 'variants.size': size.name });
    if (usedCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete size "${size.name}" because it is used in ${usedCount} product variant(s). Please deactivate it instead.`,
      });
    }

    await Size.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Size deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerSizes,
  getAdminSizes,
  createSize,
  updateSize,
  deleteSize,
};
