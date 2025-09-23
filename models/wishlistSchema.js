const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistItemsSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId, // _id of the embedded variant inside product
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    minPrice: {
      type: Number,
    },
    maxPrice: {
      type: Number,
    },
    variantImages: [String],
  },
  { timestamps: true },
);

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [wishlistItemsSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
