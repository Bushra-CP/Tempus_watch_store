const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema(
  {
    headline: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Banner', bannerSchema);
