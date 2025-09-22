const mongoose = require('mongoose');
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    strapMaterial: {
      type: String,
      required: true,
    },
    strapColor: {
      type: String,
      required: true,
    },
    dialColor: {
      type: String,
      required: true,
    },
    caseSize: {
      type: Number,
      required: true,
    },
    movementType: {
      type: String,
      required: true,
    },
    caseMaterial: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
    },
    skuCode: {
      type: String,
      required: true,
      unique: true,
    },
    variantImages: {
      type: [String],
      required: true,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    variants: [variantSchema],
    isListed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Products', productSchema);
