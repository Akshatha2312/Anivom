const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Customization = require('../models/Customization');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mockkeysecret';
  return new Razorpay({ key_id, key_secret });
};

const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Shipping address ID is required.' });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Shipping address not found or unauthorized.' });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate({
        path: 'items.customization',
        populate: { path: 'product' },
      });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Cannot create order.' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product ? product.name : 'item'} is no longer available.`,
        });
      }

      const variant = product.variants ? product.variants.find((v) => v.size === item.size && v.colour === item.colour) : null;
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant (Size: ${item.size}, Colour: ${item.colour}) is invalid for product ${product.name}.`,
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.size} / ${item.colour}). Available: ${variant.stock}`,
        });
      }

      let customizationSnapshot = null;
      if (item.customized) {
        if (!item.customization) {
          return res.status(400).json({ success: false, message: `Customization reference missing for ${product.name}.` });
        }
        const custDoc = await Customization.findById(item.customization._id || item.customization);
        if (!custDoc || custDoc.user.toString() !== req.user._id.toString()) {
          return res.status(400).json({ success: false, message: `Invalid or unauthorized customization for ${product.name}.` });
        }
        if (custDoc.product.toString() !== product._id.toString()) {
          return res.status(400).json({ success: false, message: `Customization mismatch for ${product.name}.` });
        }
        customizationSnapshot = custDoc.toObject();
      }

      const unitPrice = product.basePrice;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        colour: item.colour,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        customized: !!item.customized,
        customization: item.customized ? (item.customization._id || item.customization) : null,
        customizationSnapshot,
      });
    }

    const totalAmount = subtotal;

    const shippingSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      label: address.label || '',
    };

    const newOrder = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress: shippingSnapshot,
      subtotal,
      totalAmount,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
    });

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${newOrder._id}`,
      notes: {
        orderId: newOrder._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(options);
    } catch (err) {
      if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_razorpay_key_id')) {
        rzpOrder = {
          id: 'order_mock_' + Date.now(),
          amount: options.amount,
          currency: options.currency,
        };
      } else {
        await Order.findByIdAndDelete(newOrder._id);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order with gateway.',
          error: err.message,
        });
      }
    }

    newOrder.razorpayOrderId = rzpOrder.id;
    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: {
        order: newOrder,
        razorpayOrder: {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification details.' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        data: { order },
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Razorpay order ID mismatch.' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mockkeysecret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', key_secret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      order.orderStatus = 'FAILED';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
    }

    for (const item of order.items) {
      const updateResult = await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: { 'variants.$[elem].stock': -item.quantity },
        },
        {
          arrayFilters: [
            {
              'elem.size': item.size,
              'elem.colour': item.colour,
              'elem.stock': { $gte: item.quantity },
            },
          ],
        }
      );

      if (updateResult.modifiedCount === 0) {
        order.paymentStatus = 'FAILED';
        order.orderStatus = 'FAILED';
        await order.save();
        return res.status(400).json({
          success: false,
          message: `Stock reservation failed for item: ${item.name} (${item.size} / ${item.colour}). Insufficient remaining stock.`,
        });
      }
    }

    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      data: { order },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};
