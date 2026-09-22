const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    },
    colour: {
      type: String,
      required: true,
      enum: [
        'Black',
        'White',
        'Red',
        'Blue',
        'Green',
        'Yellow',
        'Orange',
        'Pink',
        'Purple',
        'Maroon',
        'Navy',
        'Grey',
        'Brown',
        'Beige',
        'Cream',
        'Teal',
        'Mustard',
        'Olive',
        'Sky Blue',
        'Wine',
      ],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    customized: {
      type: Boolean,
      default: false,
    },
    customization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customization',
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
