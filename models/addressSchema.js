const mongoose = require('mongoose');
const { Schema } = mongoose;

const singleAddressSchema = new Schema(
  {
    country: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    addressLine: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    townCity: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  { timestamps: true },
);

const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addresses: [singleAddressSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Address', addressSchema);
