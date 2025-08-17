const mongoose = require('mongoose');
const { Schema } = mongoose;

const offerSchema = new Schema(
  {
    offerType: {
      type: String,
      required: true,
    },
    offerTitle: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
    },
    description: {
      type: String,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    applicableProducts: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Products',
          required: true,
        },
      },
    ],
    buttonText: {
      type: String,
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    maximumOrderAmount: {
      type: Number,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    limitPerUser: {
      type: Number,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
