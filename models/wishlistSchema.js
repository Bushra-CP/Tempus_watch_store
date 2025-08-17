const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  color: {
    type: String,
    required: true,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
