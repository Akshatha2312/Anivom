const mongoose = require('mongoose');
const Colour = require('../models/Colour');
const Product = require('../models/Product');

const getCustomerColours = async (req, res, next) => {
  try {
    const colours = await Colour.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      results: colours.length,
      data: {
        colours,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminColours = async (req, res, next) => {
  try {
    const colours = await Colour.find().sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      results: colours.length,
      data: {
        colours,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createColour = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Colour name is required',
      });
    }

    const trimmedName = name.trim();

    const existing = await Colour.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: `Colour "${trimmedName}" already exists`,
      });
    }

    const colour = await Colour.create({
      name: trimmedName,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Colour created successfully',
      data: {
        colour,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateColour = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid colour ID',
      });
    }

    const colour = await Colour.findById(id);
    if (!colour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Colour not found',
      });
    }

    const { name, isActive } = req.body;
    const updates = {};

    if (name && typeof name === 'string' && name.trim() !== '') {
      const trimmedName = name.trim();

      const existing = await Colour.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      if (existing) {
        return res.status(400).json({
          status: 'fail',
          message: `Colour name "${trimmedName}" is already taken`,
        });
      }

      if (colour.name !== trimmedName) {
        await Product.updateMany(
          { 'variants.colour': colour.name },
          { $set: { 'variants.$[elem].colour': trimmedName } },
          { arrayFilters: [{ 'elem.colour': colour.name }] }
        );
      }

      updates.name = trimmedName;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updatedColour = await Colour.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Colour updated successfully',
      data: {
        colour: updatedColour,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteColour = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid colour ID',
      });
    }

    const colour = await Colour.findById(id);
    if (!colour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Colour not found',
      });
    }

    const usedCount = await Product.countDocuments({ 'variants.colour': colour.name });
    if (usedCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete colour "${colour.name}" because it is used in ${usedCount} product variant(s). Please deactivate it instead.`,
      });
    }

    await Colour.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Colour deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerColours,
  getAdminColours,
  createColour,
  updateColour,
  deleteColour,
};
