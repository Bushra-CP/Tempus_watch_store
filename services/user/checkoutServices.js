import User from '../../models/userSchema.js';
import Address from '../../models/addressSchema.js';
import Cart from '../../models/cartSchema.js';
import Order from '../../models/orderSchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const listCheckoutItems = async (userId) => {
  let cartItems = await Cart.findOne({ userId });

  cartItems.items = cartItems.items.filter((x) => x.quantity > 0);

  return cartItems;
};

const getAddress = async (userId, addressId) => {
  return await Address.findOne(
    { userId, 'addresses._id': addressId },
    { _id: 0, 'addresses.$': 1 },
  );
};

const addCheckoutDetails = async (
  userId,
  userName,
  email,
  phoneNo,
  orderDetails,
) => {
  await Cart.deleteOne({ userId });
  const newCheckout = new Order({
    userId: userId,
    userName: userName,
    email: email,
    phoneNo: phoneNo,
    orderDetails: orderDetails,
  });

  return await newCheckout.save();
};

const reduceProductsQuantity = async ({ productId, variantId, quantity }) => {
  return await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $inc: { 'variants.$.stockQuantity': -quantity } },
  );
};

const findUserInOrder = async (userId) => {
  return await Order.findOne({ userId });
};

const addMoreToOrder = async (userId, orderDetails) => {
  await Cart.deleteOne({ userId });
  const user = await Order.findOne({ userId });
  const updatedOrderItems = [...user.orderDetails, orderDetails];
  return await Order.updateOne(
    { userId },
    {
      $set: {
        orderDetails: updatedOrderItems,
      },
    },
  );
};

async function addRazorpayOrderId(userId, orderNumber, razorpayOrderId) {
  await Order.updateOne(
    { userId: userId, 'orderDetails.orderNumber': orderNumber },
    {
      $set: {
        'orderDetails.$.razorpayDetails.razorpay_order_id': razorpayOrderId,
      },
    },
  );
}

const changeWalletBalance = async (userId, walletPay) => {
  let refunded = {
    type: 'DEBIT',
    amount: walletPay,
    description: 'Order placed with wallet amount',
  };

  await User.updateOne(
    { _id: userId },
    {
      $inc: { 'wallet.balance': -walletPay },
      $push: { 'wallet.transactions': refunded },
    },
  );
};

const addCheckoutDetailsFailedOrder = async (
  userId,
  userName,
  email,
  phoneNo,
  orderDetails,
) => {
  const newCheckout = new Order({
    userId: userId,
    userName: userName,
    email: email,
    phoneNo: phoneNo,
    orderDetails: orderDetails,
  });

  return await newCheckout.save();
};

const addMoreToOrderFailedOrder = async (userId, orderDetails) => {
  const user = await Order.findOne({ userId });
  const updatedOrderItems = [...user.orderDetails, orderDetails];
  return await Order.updateOne(
    { userId },
    {
      $set: {
        orderDetails: updatedOrderItems,
      },
    },
  );
};

export default {
  listCheckoutItems,
  getAddress,
  addCheckoutDetails,
  reduceProductsQuantity,
  findUserInOrder,
  addMoreToOrder,
  addRazorpayOrderId,
  changeWalletBalance,
  addCheckoutDetailsFailedOrder,
  addMoreToOrderFailedOrder,
};
