const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    required: true,
  },
  variantId: {
    type: Schema.Types.ObjectId, // _id of the embedded variant inside product
    required: true,
  },
  variantDetails: {
    strapMaterial: String,
    strapColor: String,
    dialColor: String,
    caseSize: Number,
    movementType: String,
    caseMaterial: String,
    variantImages: [String],
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price: {
    type: Number, // snapshot of offerPrice or actualPrice at the time
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
