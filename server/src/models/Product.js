const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
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
      'Navy Blue',
      'Olive Green',
      'Soft Pink',
    ],
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    garmentImages: {
      front: { type: String, default: "" },
      back: { type: String, default: "" },
      left: { type: String, default: "" },
      right: { type: String, default: "" },
      byColour: {
        type: Map,
        of: {
          front: { type: String, default: "" },
          back: { type: String, default: "" },
          left: { type: String, default: "" },
          right: { type: String, default: "" },
        },
      },
    },
    variants: [variantSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
