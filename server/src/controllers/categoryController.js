const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getCustomerCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Category name is required',
      });
    }

    const trimmedName = name.trim();

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: `Category "${trimmedName}" already exists`,
      });
    }

    const category = await Category.create({
      name: trimmedName,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid category ID',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    const { name, isActive } = req.body;
    const updates = {};

    if (name && typeof name === 'string' && name.trim() !== '') {
      const trimmedName = name.trim();

      const existing = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      if (existing) {
        return res.status(400).json({
          status: 'fail',
          message: `Category name "${trimmedName}" is already taken`,
        });
      }

      // If category name is updated, update product string references as well
      if (category.name !== trimmedName) {
        await Product.updateMany(
          { category: category.name },
          { $set: { category: trimmedName } }
        );
      }

      updates.name = trimmedName;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid category ID',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    const usedCount = await Product.countDocuments({ category: category.name });
    if (usedCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete category "${category.name}" because it is currently assigned to ${usedCount} product(s). Please deactivate it instead.`,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
