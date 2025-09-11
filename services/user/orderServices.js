const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const fetchOrders = async (userId) => {
  return await Order.aggregate([
    { $match: { userId } },
    { $unwind: '$orderDetails' },
    { $sort: { 'orderDetails.orderDate': -1 } },
    {
      $group: {
        _id: '$_id',
        orderDetails: { $push: '$orderDetails' },
      },
    },
    { $project: { _id: 0, orderDetails: 1 } },
  ]);
};

const getByOrderNumber = async (orderNumber) => {
  return await Order.findOne(
    { 'orderDetails.orderNumber': orderNumber },
    { _id: 0, 'orderDetails.$': 1 },
  );
};

const increaseProductsQuantity = async ({ productId, variantId, quantity }) => {
  return await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $inc: { 'variants.$.stockQuantity': quantity } },
  );
};

const orderCancel = async (
  userId,
  orderId,
  refundAmount,
  cancelReason,
  additionalNotes,
) => {
  return await Order.updateOne(
    { userId, 'orderDetails._id': orderId },
    {
      $set: {
        'orderDetails.$.cancellation.cancelStatus': 'requested',
        'orderDetails.$.cancellation.cancelReason': cancelReason,
        'orderDetails.$.cancellation.additionalNotes': additionalNotes,
        'orderDetails.$.cancellation.requestedAt': new Date(),
        'orderDetails.$.cancellation.refundAmount': refundAmount,
        'orderDetails.$.orderItems.$[].cancellation.cancelStatus': 'requested',
      },
    },
  );
};

module.exports = {
  fetchOrders,
  getByOrderNumber,
  increaseProductsQuantity,
  orderCancel,
};
