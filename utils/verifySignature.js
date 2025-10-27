import { createHmac } from 'crypto';

const verifySignature = (orderId, paymentId, signature) => {
  const hmac = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

export default verifySignature;
