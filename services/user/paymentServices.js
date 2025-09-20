const razorpay = require('../../config/razorpay');

const createRazorpayOrder = async (amount) => {
  return await razorpay.orders.create({
    amount: amount * 100, // convert ₹ to paise
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
  });
};

module.exports = { createRazorpayOrder };
