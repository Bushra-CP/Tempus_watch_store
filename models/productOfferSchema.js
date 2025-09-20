const mongoose = require('mongoose');

const productOfferSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true,
  },

  productName: {
    type: String,
  },

  offerTitle: {
    type: String,
    required: true,
    trim: true,
  },

  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true,
  },

  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productOfferSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

productOfferSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProductOffer', productOfferSchema);
