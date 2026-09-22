const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Customization = require('../models/Customization');

const populateCart = async (cart) => {
  return await cart.populate([
    {
      path: 'items.product',
      select: 'name basePrice images category variants isActive',
    },
    {
      path: 'items.customization',
    },
  ]);
};

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: {
            user: req.user._id,
            items: [],
          },
        },
      });
    }

    cart = await populateCart(cart);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { product: productId, size, colour, quantity, customized, customization: customizationId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product ID',
      });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity must be a positive integer',
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found or inactive',
      });
    }

    if (!size || typeof size !== 'string') {
      return res.status(400).json({
        status: 'fail',
        message: 'Size is required',
      });
    }

    if (!colour || typeof colour !== 'string') {
      return res.status(400).json({
        status: 'fail',
        message: 'Colour is required',
      });
    }

    const variant = product.variants.find(
      (v) => v.size === size && v.colour === colour
    );

    if (!variant) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected size and colour variant is not available for this product',
      });
    }

    if (variant.stock < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected variant is out of stock',
      });
    }

    const isCustomized = Boolean(customized);
    let validCustomizationId = null;

    if (isCustomized) {
      if (!customizationId || !mongoose.Types.ObjectId.isValid(customizationId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid customization ID',
        });
      }

      const customizationDoc = await Customization.findById(customizationId);
      if (!customizationDoc) {
        return res.status(404).json({
          status: 'fail',
          message: 'Customization not found',
        });
      }

      if (customizationDoc.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to use this customization',
        });
      }

      if (customizationDoc.product.toString() !== productId.toString()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Customization product mismatch',
        });
      }

      validCustomizationId = customizationDoc._id;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex((item) => {
      const isProductMatch = item.product.toString() === productId.toString();
      const isSizeMatch = item.size === size;
      const isColourMatch = item.colour === colour;
      const isCustomizedMatch = Boolean(item.customized) === isCustomized;

      if (!isProductMatch || !isSizeMatch || !isColourMatch || !isCustomizedMatch) {
        return false;
      }

      if (isCustomized) {
        return (
          item.customization &&
          item.customization.toString() === validCustomizationId.toString()
        );
      }

      return true;
    });

    let targetQuantity = quantity;
    if (existingItemIndex > -1) {
      targetQuantity = cart.items[existingItemIndex].quantity + quantity;
    }

    if (targetQuantity > variant.stock) {
      return res.status(400).json({
        status: 'fail',
        message: `Requested quantity exceeds available stock (${variant.stock} available)`,
      });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = targetQuantity;
    } else {
      cart.items.push({
        product: productId,
        size,
        colour,
        quantity,
        customized: isCustomized,
        customization: isCustomized ? validCustomizationId : undefined,
      });
    }

    await cart.save();
    cart = await populateCart(cart);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid cart item ID',
      });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity must be a positive integer',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart item not found',
      });
    }

    const product = await Product.findOne({ _id: item.product, isActive: true });
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found or no longer active',
      });
    }

    const variant = product.variants.find(
      (v) => v.size === item.size && v.colour === item.colour
    );

    if (!variant) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected size and colour variant is no longer available',
      });
    }

    if (quantity > variant.stock) {
      return res.status(400).json({
        status: 'fail',
        message: `Requested quantity exceeds available stock (${variant.stock} available)`,
      });
    }

    item.quantity = quantity;

    await cart.save();
    cart = await populateCart(cart);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid cart item ID',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found',
      });
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === itemId.toString()
    );

    if (!itemExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart item not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId.toString()
    );

    await cart.save();
    cart = await populateCart(cart);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: {
            user: req.user._id,
            items: [],
          },
        },
      });
    }

    cart.items = [];
    await cart.save();
    cart = await populateCart(cart);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const validateCheckoutSummary = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Your cart is empty. Add products to cart before checking out.',
      });
    }

    cart = await populateCart(cart);

    let totalItemCount = 0;
    let subtotal = 0;
    const validatedItems = [];

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = await Product.findOne({ _id: item.product._id || item.product, isActive: true });

      if (!product) {
        return res.status(400).json({
          status: 'fail',
          message: `Item "${item.product.name || item.product}" is no longer available.`,
        });
      }

      const variant = product.variants.find(
        (v) => v.size === item.size && v.colour === item.colour
      );

      if (!variant) {
        return res.status(400).json({
          status: 'fail',
          message: `Selected variant (${item.size}/${item.colour}) for "${product.name}" is no longer available.`,
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid quantity for "${product.name}".`,
        });
      }

      if (item.quantity > variant.stock) {
        return res.status(400).json({
          status: 'fail',
          message: `Requested quantity (${item.quantity}) for "${product.name}" exceeds available stock (${variant.stock}).`,
        });
      }

      if (item.customized) {
        if (!item.customization) {
          return res.status(400).json({
            status: 'fail',
            message: `Customization reference missing for "${product.name}".`,
          });
        }

        const customizationId = item.customization._id || item.customization;
        const customizationDoc = await Customization.findById(customizationId);

        if (!customizationDoc) {
          return res.status(400).json({
            status: 'fail',
            message: `Customization for "${product.name}" not found.`,
          });
        }

        if (customizationDoc.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            status: 'fail',
            message: `Unauthorized customization reference for "${product.name}".`,
          });
        }

        if (customizationDoc.product.toString() !== product._id.toString()) {
          return res.status(400).json({
            status: 'fail',
            message: `Customization product mismatch for "${product.name}".`,
          });
        }
      }

      const unitPrice = product.basePrice;
      const itemSubtotal = unitPrice * item.quantity;
      totalItemCount += item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          images: product.images,
          category: product.category,
        },
        size: item.size,
        colour: item.colour,
        quantity: item.quantity,
        customized: Boolean(item.customized),
        customization: item.customization,
        unitPrice,
        itemSubtotal,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          items: validatedItems,
          totalItemCount,
          subtotal,
          shippingFee: 0,
          totalAmount: subtotal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  validateCheckoutSummary,
};

