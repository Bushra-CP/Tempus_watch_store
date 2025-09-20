const Order = require('../../models/orderSchema');
const { createRazorpayOrder } = require('../../services/user/paymentServices');
const verifySignature = require('../../utils/verifySignature');

// ✅ Create Razorpay order and save it in DB
exports.createOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    // orderId = MongoDB orderDetails._id (from your DB)
    // amount = orderDetails.orderTotal

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    });

    // Update orderDetails with razorpay details
    const order = await Order.findOneAndUpdate(
      { 'orderDetails._id': orderId },
      {
        $set: {
          'orderDetails.$.razorpayDetails.razorpay_order_id': razorpayOrder.id,
          'orderDetails.$.paymentStatus': 'pending',
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderDbId: orderId,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid signature' });
    }

    const order = await Order.findOneAndUpdate(
      { 'orderDetails._id': orderId },
      {
        $set: {
          'orderDetails.$.paymentStatus': 'completed',
          'orderDetails.$.transactionId': razorpay_payment_id,
          'orderDetails.$.razorpayDetails.razorpay_payment_id':
            razorpay_payment_id,
          'orderDetails.$.razorpayDetails.razorpay_signature':
            razorpay_signature,
        },
      },
      { new: true },
    );

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
