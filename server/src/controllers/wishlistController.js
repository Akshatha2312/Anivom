const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const formatWishlistProducts = (wishlist) => {
  if (!wishlist || !wishlist.products) return [];
  const items = [];
  for (const item of wishlist.products) {
    if (!item) continue;
    // Support populated subdocument item.product or legacy populated direct ObjectId item
    const rawProd = item.product && item.product._id ? item.product : (item._id ? item : null);
    if (!rawProd || rawProd.isActive === false) continue;
    const prodObj = rawProd.toObject ? rawProd.toObject() : { ...rawProd };
    const selectedColour = item.colour || '';
    items.push({
      ...prodObj,
      selectedColour,
      initialColor: selectedColour || prodObj.initialColor || '',
    });
  }
  return items;
};

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products.product',
      select: 'name description category basePrice images variants garmentImages isActive',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const activeProducts = formatWishlistProducts(wishlist);

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
    const { productId, colour } = req.body;
    const targetColour = colour || '';

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

    const existsIndex = wishlist.products.findIndex((item) => {
      if (!item) return false;
      const itemProdId = item.product ? item.product.toString() : item.toString();
      const itemColour = item.colour || '';
      return itemProdId === productId.toString() && itemColour === targetColour;
    });

    if (existsIndex === -1) {
      wishlist.products.push({ product: productId, colour: targetColour });
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'products.product',
      select: 'name description category basePrice images variants garmentImages isActive',
    });

    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: {
        wishlist: {
          id: wishlist._id,
          products: formatWishlistProducts(wishlist),
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
    const targetColour = req.query.colour || req.body?.colour || null;

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

    wishlist.products = wishlist.products.filter((item) => {
      if (!item) return false;
      const itemProdId = item.product ? item.product.toString() : item.toString();
      const itemColour = item.colour || '';
      if (itemProdId !== productId.toString()) return true;
      if (targetColour !== null && targetColour !== undefined) {
        return itemColour !== targetColour;
      }
      return false;
    });
    await wishlist.save();

    await wishlist.populate({
      path: 'products.product',
      select: 'name description category basePrice images variants garmentImages isActive',
    });

    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist',
      data: {
        wishlist: {
          id: wishlist._id,
          products: formatWishlistProducts(wishlist),
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
