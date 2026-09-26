const mongoose = require('mongoose');

const layerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['text', 'predefined_design', 'uploaded_image'],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    position: {
      x: {
        type: Number,
        required: true,
        default: 0,
      },
      y: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    scale: {
      x: {
        type: Number,
        required: true,
        default: 1,
      },
      y: {
        type: Number,
        required: true,
        default: 1,
      },
    },
    rotation: {
      type: Number,
      required: true,
      default: 0,
    },
    text: {
      content: {
        type: String,
        required: function () {
          return this.type === 'text';
        },
      },
      fontFamily: {
        type: String,
        default: 'Arial',
      },
      fontSize: {
        type: Number,
        default: 16,
      },
      color: {
        type: String,
        default: '#000000',
      },
      fontWeight: {
        type: String,
        default: 'normal',
      },
      fontStyle: {
        type: String,
        default: 'normal',
      },
      textAlign: {
        type: String,
        default: 'left',
      },
    },
    design: {
      designId: {
        type: String,
        required: function () {
          return this.type === 'predefined_design';
        },
      },
      url: {
        type: String,
      },
    },
    image: {
      url: {
        type: String,
        required: function () {
          return this.type === 'uploaded_image';
        },
      },
    },
  },
  { _id: true }
);

const customizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    },
    layers: [layerSchema],
    status: {
      type: String,
      enum: ['draft', 'saved', 'ordered'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

customizationSchema.index({ user: 1, createdAt: -1 });

const Customization = mongoose.model('Customization', customizationSchema);

module.exports = Customization;
