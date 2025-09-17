const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const fetchOrders = async (userId, search) => {
  let query = { userId };

  let pipeline = [{ $match: query }, { $unwind: '$orderDetails' }];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'orderDetails.orderNumber': { $regex: search, $options: 'i' } },
          {
            'orderDetails.orderItems.productName': {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { 'orderDetails.orderDate': -1 } },
    {
      $group: {
        _id: '$_id',
        orderDetails: { $push: '$orderDetails' },
      },
    },
    { $project: { _id: 0, orderDetails: 1 } },
  );

  return await Order.aggregate(pipeline);
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
      },
    },
  );
};

const returnOrder = async (
  userId,
  orderId,
  refundAmount,
  returnReason,
  additionalNotes,
) => {
  return await Order.updateOne(
    { userId, 'orderDetails._id': orderId },
    {
      $set: {
        'orderDetails.$.return.returnStatus': 'requested',
        'orderDetails.$.return.returnReason': returnReason,
        'orderDetails.$.return.additionalNotes': additionalNotes,
        'orderDetails.$.return.requestedAt': new Date(),
        'orderDetails.$.return.refundAmount': refundAmount,
      },
    },
  );
};

const cancelItem = async (
  orderId,
  orderNumber,
  productId,
  variantId,
  refundAmount,
  cancelReason,
  additionalNotes,
) => {
  const updated = await Order.updateOne(
    {
      'orderDetails._id': orderId,
      'orderDetails.orderNumber': orderNumber,
      'orderDetails.orderItems.productId': productId,
      'orderDetails.orderItems.variantId': variantId,
    },
    {
      $set: {
        'orderDetails.$.orderItems.$[item].cancellation.cancelStatus':
          'requested',
        'orderDetails.$.orderItems.$[item].cancellation.cancelReason':
          cancelReason,
        'orderDetails.$.orderItems.$[item].cancellation.additionalNotes':
          additionalNotes,
        'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
          new Date(),
        'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
          refundAmount,
      },
    },
    {
      arrayFilters: [
        { 'item.productId': productId, 'item.variantId': variantId },
      ],
    },
  );
  console.log(updated.modifiedCount);
};

const returnItem = async (
  orderId,
  orderNumber,
  productId,
  variantId,
  refundAmount,
  returnReason,
  additionalNotes,
) => {
  const updated = await Order.updateOne(
    {
      'orderDetails._id': orderId,
      'orderDetails.orderNumber': orderNumber,
      'orderDetails.orderItems.productId': productId,
      'orderDetails.orderItems.variantId': variantId,
    },
    {
      $set: {
        'orderDetails.$.orderItems.$[item].return.returnStatus': 'requested',
        'orderDetails.$.orderItems.$[item].return.returnReason': returnReason,
        'orderDetails.$.orderItems.$[item].return.additionalNotes':
          additionalNotes,
        'orderDetails.$.orderItems.$[item].return.requestedAt': new Date(),
        'orderDetails.$.orderItems.$[item].return.refundAmount': refundAmount,
      },
    },
    {
      arrayFilters: [
        { 'item.productId': productId, 'item.variantId': variantId },
      ],
    },
  );
  console.log(updated.modifiedCount);
};

module.exports = {
  fetchOrders,
  getByOrderNumber,
  increaseProductsQuantity,
  orderCancel,
  returnOrder,
  cancelItem,
  returnItem,
};
