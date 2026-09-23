const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name description category basePrice images variants isActive',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const activeProducts = (wishlist.products || []).filter((p) => p && p.isActive !== false);

    res.status(200).json({
      status: 'success',
      data: {
        wishlist: {
          id: wishlist._id,
          products: activeProducts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid Product ID is required',
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found or inactive',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.some((id) => id.toString() === productId.toString());
    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'products',
      select: 'name description category basePrice images variants isActive',
    });

    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: {
        wishlist: {
          id: wishlist._id,
          products: wishlist.products.filter((p) => p && p.isActive !== false),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid Product ID is required',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist',
        data: { wishlist: { products: [] } },
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name description category basePrice images variants isActive',
    });

    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist',
      data: {
        wishlist: {
          id: wishlist._id,
          products: wishlist.products.filter((p) => p && p.isActive !== false),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
