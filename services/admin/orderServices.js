const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const messages = require('../../config/messages');
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
  let message = '';
  const order = await Order.findOne({ 'orderDetails._id': orderId });

  const orderDetail = order.orderDetails.id(orderId);
  const userId = order.userId;
  if (action === 'approve') {
    if (orderDetail.return && orderDetail.return.returnStatus === 'requested') {
      orderDetail.return.returnStatus = 'approved';
      orderDetail.return.refundAmount = refundAmount;
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
      }
    }

    //adding refund amount to wallet and adding necessary details
    let refunded = {
      type: 'CREDIT',
      amount: refundAmount,
      description: `Order return-Order ID:${orderDetail.orderNumber}`,
      orderId: orderDetail._id,
    };

    orderDetail.refundTransactions = refunded;

    await User.updateOne(
      { _id: userId },
      {
        $inc: { 'wallet.balance': refundAmount },
        $push: { 'wallet.transactions': refunded },
      },
    );
    message = 'Return approved';
  } else if (action === 'reject') {
    if (orderDetail.return && orderDetail.return.returnStatus === 'requested') {
      orderDetail.return.returnStatus = 'rejected';
    }
    message = 'Return rejected';
  }

  await order.save();
  return message;
};

const handleProductRequest = async (
  orderId,
  productId,
  variantId,
  notes,
  action,
  refundAmount,
) => {
  let message = '';

  // find order that contains this orderDetail
  const order = await Order.findOne({ 'orderDetails._id': orderId });
  if (!order) throw new Error('Order not found');

  const userId = order.userId;

  const detail = order.orderDetails.id(orderId);
  if (!detail) throw new Error('Order detail not found');

  // normalize refundAmount to number
  refundAmount = Number(refundAmount) || 0;

  const product = detail.orderItems.find(
    (item) =>
      item.productId.equals(productId) && item.variantId.equals(variantId),
  );
  if (!product) throw new Error('Product not found in this order');

  // ensure product.return exists
  product.return = product.return || {};

  // ensure orderTotalAfterProductReturn is a number
  detail.orderTotalAfterProductReturn =
    Number(detail.orderTotalAfterProductReturn) ||
    Number(detail.orderTotal) ||
    0;

  if (action === 'approve') {
    if (product.return.returnStatus === 'requested') {
      const coupon = detail.couponApplied || { isApplied: false };

      if (coupon.isApplied) {
        const prospectiveTotal =
          detail.orderTotalAfterProductReturn - refundAmount;

        // case 1: order total remains >= coupon min -> give full refund
        if (prospectiveTotal > coupon.minPurchaseAmount) {
          const refunded = {
            type: 'CREDIT',
            amount: refundAmount,
            description: `Order return-Order ID:${detail.orderNumber}`,
            notes: `✅ Return Approved\nYour return has been approved. A refund of ₹${refundAmount} will be credited to your wallet.`,
            orderId: detail._id,
          };

          detail.orderTotalAfterProductReturn -= refundAmount;
          product.return.returnStatus = 'approved';
          product.return.refundAmount = refundAmount;
          product.return.requestReviewedDetails = refunded;

          await Products.updateOne(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.stockQuantity': product.quantity } },
          );

          await User.updateOne(
            { _id: userId },
            {
              $inc: { 'wallet.balance': refundAmount },
              $push: { 'wallet.transactions': refunded },
            },
          );

          message = 'Product return approved';
        }

        // case 2: prospective total < coupon min
        else {
          // coupon not yet deducted
          if (!detail.couponAmountDeducted) {
            if (refundAmount > coupon.couponAmount) {
              const adjustedRefund = refundAmount - coupon.couponAmount;

              const refunded = {
                type: 'CREDIT',
                amount: adjustedRefund,
                description: `Order return-Order ID:${detail.orderNumber}`,
                notes: `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.\nSince a coupon was applied during your purchase, and the return lowers your order value below the eligible amount, the coupon discount of ₹${coupon.couponAmount} has been adjusted from your refund.\nThank you for your understanding and for shopping with us. 💙`,
                orderId: detail._id,
              };

              detail.orderTotalAfterProductReturn -= adjustedRefund;
              detail.couponAmountDeducted = true;

              product.return.returnStatus = 'approved';
              product.return.refundAmount = adjustedRefund;
              product.return.requestReviewedDetails = refunded;

              await Products.updateOne(
                { _id: productId, 'variants._id': variantId },
                { $inc: { 'variants.$.stockQuantity': product.quantity } },
              );

              await User.updateOne(
                { _id: userId },
                {
                  $inc: { 'wallet.balance': adjustedRefund },
                  $push: { 'wallet.transactions': refunded },
                },
              );

              message = `A coupon has been applied to this order at checkout. After return, order total becomes less than the coupon’s minimum eligibility of ₹${coupon.minPurchaseAmount}. The applied coupon (₹${coupon.couponAmount}) has been revoked and refund reduced by ₹${coupon.couponAmount}.`;
            } else if (refundAmount < coupon.couponAmount) {
              const refunded = {
                description: `Return request-Order ID:${detail.orderNumber}`,
                notes: `We’ve reviewed your return request for ${product.productName} / ${detail.orderNumber}.\nAt the time of purchase, you used a coupon which provided a discount of ₹${coupon.couponAmount}. The discount applied to your order is higher than the price of the returned product (₹${product.finalDiscountedPrice}).\nAs per our policy, no return/refund is applicable since the coupon benefit has already exceeded the item value.\nThank you for shopping with us. 💙`,
                orderId: detail._id,
              };

              product.return.returnStatus = 'rejected';
              product.return.requestReviewedDetails = refunded;

              await User.updateOne(
                { _id: userId },
                { $push: { 'wallet.transactions': refunded } },
              );

              message = `❌ Return Blocked. Coupon ₹${coupon.couponAmount} is greater than item value ₹${product.finalDiscountedPrice}. Return request denied.`;
            }
          } else {
            const refunded = {
              type: 'CREDIT',
              amount: refundAmount,
              description: `Order return-Order ID:${detail.orderNumber}`,
              notes: `✅ Return Approved\nYour return has been approved. A refund of ₹${refundAmount} will be credited to your wallet.`,
              orderId: detail._id,
            };

            detail.orderTotalAfterProductReturn -= refundAmount;

            product.return.returnStatus = 'approved';
            product.return.refundAmount = refundAmount;
            product.return.requestReviewedDetails = refunded;

            await Products.updateOne(
              { _id: productId, 'variants._id': variantId },
              { $inc: { 'variants.$.stockQuantity': product.quantity } },
            );

            await User.updateOne(
              { _id: userId },
              {
                $inc: { 'wallet.balance': refundAmount },
                $push: { 'wallet.transactions': refunded },
              },
            );

            message = 'Product return approved';
          }
        }
      } else {
        // no coupon applied
        const refunded = {
          type: 'CREDIT',
          amount: refundAmount,
          description: `Order return-Order ID:${detail.orderNumber}`,
          notes: `✅ Return Approved\nYour return has been approved. A refund of ₹${refundAmount} will be credited to your wallet.`,
          orderId: detail._id,
        };

        detail.orderTotalAfterProductReturn -= refundAmount;

        product.return.returnStatus = 'approved';
        product.return.refundAmount = refundAmount;
        product.return.requestReviewedDetails = refunded;

        await Products.updateOne(
          { _id: productId, 'variants._id': variantId },
          { $inc: { 'variants.$.stockQuantity': product.quantity } },
        );

        await User.updateOne(
          { _id: userId },
          {
            $inc: { 'wallet.balance': refundAmount },
            $push: { 'wallet.transactions': refunded },
          },
        );

        message = 'Product return approved';
      }
    }
  } else if (action === 'reject') {
    if (product.return.returnStatus === 'requested') {
      let details = {
        description: `Order ID:${detail.orderNumber}`,
        notes,
      };

      product.return.returnStatus = 'rejected';
      product.return.requestReviewedDetails = details;

      message = `Return rejected: ${notes || 'No reason provided'}`;
    }
  }

  await order.save();
  return { order, message };
};

module.exports = {
  getOrders,
  updateOrderStatus,
  getByOrderId,
  handleOrderRequest,
  handleProductRequest,
};
