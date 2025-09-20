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
  await Order.updateOne(
    { userId, 'orderDetails._id': orderId },
    {
      $set: {
        'orderDetails.$.status': 'cancelled',
        'orderDetails.$.cancellation.cancelStatus': 'cancelled',
        'orderDetails.$.cancellation.cancelReason': cancelReason,
        'orderDetails.$.cancellation.additionalNotes': additionalNotes,
        'orderDetails.$.cancellation.requestedAt': new Date(),
        'orderDetails.$.cancellation.refundAmount': refundAmount,
      },
    },
  );

  const order = await Order.findOne({ 'orderDetails._id': orderId });

  const orderDetail = order.orderDetails.id(orderId);

  // ✅ Increase stock back for each product
  for (const item of orderDetail.orderItems) {
    if (item.cancellation.cancelStatus != 'approved') {
      await Products.updateOne(
        { _id: item.productId, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stockQuantity': item.quantity } },
      );
      let refunded = {
        type: 'CREDIT',
        amount: refundAmount,
        description: `Order Cancel-Order ID:${orderDetail.orderNumber}`,
        orderId: orderDetail._id,
      };

      await User.updateOne(
        { _id: userId },
        {
          $inc: { 'wallet.balance': refundAmount },
          $push: { 'wallet.transactions': refunded },
        },
      );
    }
  }
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
  await Order.updateOne(
    {
      'orderDetails._id': orderId,
      'orderDetails.orderNumber': orderNumber,
      'orderDetails.orderItems.productId': productId,
      'orderDetails.orderItems.variantId': variantId,
    },
    {
      $set: {
        'orderDetails.$.orderItems.$[item].cancellation.cancelStatus':
          'approved',
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

  const order = await Order.findOne({
    'orderDetails._id': orderId,
  });
  const userId = order.userId;

  const detail = order.orderDetails.id(orderId);

  const product = detail.orderItems.find(
    (item) =>
      item.productId.equals(productId) && item.variantId.equals(variantId),
  );

  // ✅ Increase stock back for each product
  await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $inc: { 'variants.$.stockQuantity': product.quantity } },
  );
  let refunded = {
    type: 'CREDIT',
    amount: refundAmount,
    description: `Order Cancel-Order ID:${detail.orderNumber}`,
    orderId: detail._id,
  };

  await User.updateOne(
    { _id: userId },
    {
      $inc: { 'wallet.balance': refundAmount },
      $push: { 'wallet.transactions': refunded },
    },
  );
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
