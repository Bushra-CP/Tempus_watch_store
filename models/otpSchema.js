const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 }, // otp expires after 1 minute
});

module.exports = mongoose.model('Otp', otpSchema);
