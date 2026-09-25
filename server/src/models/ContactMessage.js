const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    orderId: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: 'General Support Inquiry',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'resolved'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
