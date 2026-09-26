const mongoose = require('mongoose');
const Customization = require('../models/Customization');
const Product = require('../models/Product');

const createCustomization = async (req, res, next) => {
  try {
    const { product: productId, size, colour, layers, status } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    if (!size || typeof size !== 'string') {
      return res.status(400).json({
        status: 'fail',
        message: 'Size is required',
      });
    }

    const sizeExists = product.variants.some((v) => v.size === size);
    if (!sizeExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected size is not available for this product',
      });
    }

    if (!colour || typeof colour !== 'string') {
      return res.status(400).json({
        status: 'fail',
        message: 'Colour is required',
      });
    }

    const colourExists = product.variants.some((v) => v.colour === colour);
    if (!colourExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected colour is not available for this product',
      });
    }

    if (!Array.isArray(layers)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Layers must be an array',
      });
    }

    const validLayerTypes = ['text', 'predefined_design', 'uploaded_image'];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer || !validLayerTypes.includes(layer.type)) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid layer type at index ${i}`,
        });
      }
    }

    const allowedStatuses = ['draft', 'saved', 'ordered'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid customization status',
      });
    }

    const customization = await Customization.create({
      user: req.user._id,
      product: productId,
      size,
      colour,
      layers,
      status: status || 'draft',
    });

    res.status(201).json({
      status: 'success',
      data: {
        customization,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomizations = async (req, res, next) => {
  try {
    const customizations = await Customization.find({ user: req.user._id })
      .populate('product', 'name basePrice images')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      results: customizations.length,
      data: {
        customizations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    const customization = await Customization.findOne({
      _id: id,
      user: req.user._id,
    }).populate('product', 'name basePrice images variants');

    if (!customization) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        customization,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomization = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    const existing = await Customization.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    const allowedFields = ['size', 'colour', 'layers', 'status'];
    const updates = {};

    if (req.body.status) {
      const allowedStatuses = ['draft', 'saved', 'ordered'];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid customization status',
        });
      }
    }

    if (req.body.layers) {
      if (!Array.isArray(req.body.layers)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Layers must be an array',
        });
      }
      const validLayerTypes = ['text', 'predefined_design', 'uploaded_image'];
      for (let i = 0; i < req.body.layers.length; i++) {
        const layer = req.body.layers[i];
        if (!layer || !validLayerTypes.includes(layer.type)) {
          return res.status(400).json({
            status: 'fail',
            message: `Invalid layer type at index ${i}`,
          });
        }
      }
    }

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const customization = await Customization.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        customization,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomization = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    const customization = await Customization.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!customization) {
      return res.status(404).json({
        status: 'fail',
        message: 'Customization not found',
      });
    }

    if (customization.status === 'ordered') {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete an ordered customization',
      });
    }

    await Customization.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Customization deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomization,
  getCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
};
