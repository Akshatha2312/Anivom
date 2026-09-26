const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    colour: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.pre('init', function (doc) {
  if (doc && Array.isArray(doc.products)) {
    doc.products = doc.products.map((item) => {
      if (!item) return item;
      // Convert legacy plain ObjectId string/ref to subdocument structure { product: ObjectId, colour: '' }
      if (
        item instanceof mongoose.Types.ObjectId ||
        typeof item === 'string' ||
        (typeof item === 'object' && !item.product && (item._id || mongoose.Types.ObjectId.isValid(item)))
      ) {
        const productId = item._id || item;
        return { product: productId, colour: '' };
      }
      return item;
    });
  }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
