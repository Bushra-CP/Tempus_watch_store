import { orders } from '../../config/razorpay';

const createRazorpayOrder = async (amount) => {
  return await orders.create({
    amount: amount * 100, // convert ₹ to paise
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
  });
};

export default { createRazorpayOrder };
