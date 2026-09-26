const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General',
    },
    svg: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

designSchema.index({ isActive: 1, category: 1, createdAt: -1 });

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
