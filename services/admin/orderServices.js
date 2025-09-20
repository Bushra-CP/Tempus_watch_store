const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const getOrders = async (search, status, sort, page, limit) => {
  let match = {};

  //SEARCH
  if (search) {
    match.$or = [
      { 'orderDetails.orderNumber': { $regex: search, $options: 'i' } },
      { 'userDetails.email': { $regex: search, $options: 'i' } },
      { 'userDetails.firstName': { $regex: search, $options: 'i' } },
      { 'userDetails.lastName': { $regex: search, $options: 'i' } },
    ];
  }

  //STATUS
  if (status && status !== 'all') {
    match['orderDetails.status'] = status;
  }

  //SORTING
  let sortOption = {};
  switch (sort) {
    case 'date_desc':
      sortOption['orderDetails.orderDate'] = -1;
      break;
    case 'date_asc':
      sortOption['orderDetails.orderDate'] = 1;
      break;
    case 'amount_desc':
      sortOption['orderDetails.orderTotal'] = -1;
      break;
    case 'amount_asc':
      sortOption['orderDetails.orderTotal'] = 1;
      break;
    default:
      sortOption['orderDetails.orderDate'] = -1;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    { $match: match },
    {
      $project: {
        _id: 0,
        userId: 1,
        'userDetails.firstName': 1,
        'userDetails.lastName': 1,
        'userDetails.email': 1,
        'userDetails.phoneNo': 1,
        orderDetails: 1,
      },
    },
    { $sort: sortOption },
    { $skip: skip },
    { $limit: limit },
  ]);

  // Total count for pagination
  const totalOrders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    { $match: match },
    { $count: 'total' },
  ]);

  const total = totalOrders[0] ? totalOrders[0].total : 0;

  return { orders, total };
};

const updateOrderStatus = async (orderId, status) => {
  return await Order.updateOne(
    { 'orderDetails._id': orderId },
    {
      $set: {
        'orderDetails.$.status': status,
      },
    },
  );
};

const getByOrderId = async (orderId) => {
  return await Order.findOne(
    { 'orderDetails._id': orderId },
    { _id: 0, 'orderDetails.$': 1 },
  );
};

const handleOrderRequest = async (orderId, action, refundAmount) => {
  const order = await Order.findOne({ 'orderDetails._id': orderId });

  const orderDetail = order.orderDetails.id(orderId);
  const userId = order.userId;
  if (action === 'approve') {
    if (orderDetail.return && orderDetail.return.returnStatus === 'requested') {
      orderDetail.return.returnStatus = 'approved';
      orderDetail.status = 'returned';
    }

    // ✅ Increase stock back for each product
    for (const item of orderDetail.orderItems) {
      const isCancelled = item.cancellation?.cancelStatus === 'approved';
      const isReturned = item.return?.returnStatus === 'approved';
      if (!isCancelled && !isReturned) {
        await Products.updateOne(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stockQuantity': item.quantity } },
        );
        let refunded = {
          type: 'CREDIT',
          amount: refundAmount,
          description: `Order return-Order ID:${orderDetail.orderNumber}`,
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
  } else if (action === 'reject') {
    if (orderDetail.return && orderDetail.return.returnStatus === 'requested') {
      orderDetail.return.returnStatus = 'rejected';
    }
  }

  await order.save();
};

const handleProductRequest = async (
  orderId,
  productId,
  variantId,
  action,
  refundAmount,
) => {
  const order = await Order.findOne({
    'orderDetails._id': orderId,
  });
  const userId = order.userId;
  if (!order) throw new Error('Order not found');

  const detail = order.orderDetails.id(orderId);
  if (!detail) throw new Error('Order detail not found');

  const product = detail.orderItems.find(
    (item) =>
      item.productId.equals(productId) && item.variantId.equals(variantId),
  );

  if (!product) throw new Error('Product not found in this order');

  if (action === 'approve') {
    if (product.return.returnStatus === 'requested') {
      product.return.returnStatus = 'approved';

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
    }
  } else if (action === 'reject') {
    if (product.cancellation.cancelStatus === 'requested') {
      product.cancellation.cancelStatus = 'rejected';
    } else if (product.return.returnStatus === 'requested') {
      product.return.returnStatus = 'rejected';
    }
  }

  await order.save();
  return order;
};

module.exports = {
  getOrders,
  updateOrderStatus,
  getByOrderId,
  handleOrderRequest,
  handleProductRequest,
};
