const mongoose = require('mongoose');

const categoryOfferSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  categoryName: {
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

categoryOfferSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

categoryOfferSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CategoryOffer', categoryOfferSchema);
