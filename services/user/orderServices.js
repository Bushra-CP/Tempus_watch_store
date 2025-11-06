import User from '../../models/userSchema.js';
import Order from '../../models/orderSchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const fetchOrders = async (userId, search, page, limit) => {
  const skip = (page - 1) * limit;

  const pipeline = [{ $match: { userId } }, { $unwind: '$orderDetails' }];

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
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $group: {
              _id: '$_id',
              orderDetails: { $push: '$orderDetails' },
            },
          },
          { $project: { _id: 0, orderDetails: 1 } },
        ],
      },
    },
  );

  const result = await Order.aggregate(pipeline);

  const total = result[0]?.metadata[0]?.total || 0;
  const orders = result[0]?.data || [];

  return {
    orders,
    total,
    totalPages: Math.ceil(total / limit),
  };
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
  let message = '',
    status = '';

  let notes = `₹We’ve successfully processed your cancellation request.

Thanks for shopping with us. 💙`;

  message = 'Cancel request approved successfully!';
  status = 'success';

  const finalRefund = refundAmount - 20;

  await Order.updateOne(
    { userId, 'orderDetails._id': orderId },
    {
      $set: {
        'orderDetails.$.status': 'cancelled',
        'orderDetails.$.cancellation.cancelStatus': 'cancelled',
        'orderDetails.$.cancellation.cancelReason': cancelReason,
        'orderDetails.$.cancellation.additionalNotes': notes,
        'orderDetails.$.cancellation.requestedAt': new Date(),
        'orderDetails.$.cancellation.refundAmount': finalRefund,
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
    }
  }

  let refunded = {
    type: 'CREDIT',
    amount: finalRefund,
    description: `Order Cancel-Order ID:${orderDetail.orderNumber}`,
    orderId: orderDetail._id,
  };

  await User.updateOne(
    { _id: userId },
    {
      $inc: { 'wallet.balance': finalRefund },
      $push: { 'wallet.transactions': refunded },
    },
  );

  await Order.updateOne(
    { userId, 'orderDetails._id': orderId },
    { $push: { 'orderDetails.$.refundTransactions': refunded } },
  );

  return { status, message };
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
  //message variable to pass to user
  let message = '',
    status = '';

  // Fetch order first
  const order = await Order.findOne({ 'orderDetails._id': orderId });
  const userId = order.userId;
  const detail = order.orderDetails.id(orderId);

  const product = detail.orderItems.find(
    (item) =>
      item.productId.equals(productId) && item.variantId.equals(variantId),
  );

  ////// Check if coupon applied at time of checkout ///////
  if (detail.couponApplied && detail.couponApplied.isApplied) {
    const couponAmount = detail.couponApplied.couponAmount;
    const minPurchaseAmount = detail.couponApplied.minPurchaseAmount;

    const orderTotal = detail.orderTotalAfterProductReturn;

    const itemPrice = refundAmount;

    const newTotal = orderTotal - itemPrice;

    //if it is the last item in the order
    if (detail.totalProducts == 1) {
      const finalRefund = detail.orderTotalAfterProductReturn - 20;

      message = 'Return request approved successfully!';
      status = 'success';

      const note = `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.
          \nSince this was the last or only item in your order, we’ve refunded the remaining order amount.
          \nThank you for shopping with us. 💙`;

      await Order.updateOne(
        {
          'orderDetails._id': orderId,
          'orderDetails.orderNumber': orderNumber,
        },
        {
          $set: {
            'orderDetails.$.couponAmountDeducted': true,
          },
          $inc: {
            'orderDetails.$.orderTotalAfterProductReturn': -finalRefund,
          },
        },
      );

      //refund details
      let refunded = {
        type: 'CREDIT',
        amount: finalRefund,
        description: `Order Item Cancel-Order ID:${detail.orderNumber}`,
        orderId: detail._id,
      };

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
              note,
            'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
              new Date(),
            'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
              finalRefund,
            'orderDetails.$.orderItems.$[item].cancellation.requestReviewedDetails':
              refunded,
          },
        },
        {
          arrayFilters: [
            { 'item.productId': productId, 'item.variantId': variantId },
          ],
        },
      );

      // 3️⃣ Restore stock
      await Products.updateOne(
        { _id: productId, 'variants._id': variantId },
        { $inc: { 'variants.$.stockQuantity': product.quantity } },
      );

      //Credit refund amount to wallet
      await User.updateOne(
        { _id: userId },
        {
          $inc: { 'wallet.balance': finalRefund },
          $push: { 'wallet.transactions': refunded },
        },
      );

      await Order.updateOne(
        { userId, 'orderDetails._id': orderId },
        { $push: { 'orderDetails.$.refundTransactions': refunded } },
      );

      return { status, message };
    }

    ///// If newTotal < coupon.minPurchaseAmount → coupon invalid: ////
    if (newTotal < minPurchaseAmount) {
      ///////// if coupon amount is not deducted yet ///////////
      if (!detail.couponAmountDeducted) {
        ///////CASE: If refundAmount < coupon.discountAmount → ❌ reject cancellation.
        if (itemPrice < couponAmount) {
          const note = `❌ Cancellation Blocked.
         This product value is less than the applied coupon discount of ₹${couponAmount}.
         Cancel request denied.`;

          message = 'Cancellation request rejected.';
          status = 'error';

          //  Update cancellation status and details
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
                  'rejected',
                'orderDetails.$.orderItems.$[item].cancellation.cancelReason':
                  cancelReason,
                'orderDetails.$.orderItems.$[item].cancellation.additionalNotes':
                  note,
                'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
                  new Date(),
                'orderDetails.$.orderItems.$[item].cancellation.refundAmount': 0,
              },
            },
            {
              arrayFilters: [
                { 'item.productId': productId, 'item.variantId': variantId },
              ],
            },
          );

          return { status, message };
        } else if (itemPrice > couponAmount) {
          /////////// Coupon invalid, reduce applied coupon amount from refund /////////////
          const finalRefund = refundAmount - couponAmount;

          message = 'Cancel request approved successfully!';
          status = 'success';

          const note = `We’ve successfully processed your cancellation request for ${product.productName} / ${detail.orderNumber}.
          \nSince a coupon was applied during your purchase, and the return lowers your order value below the eligible amount, 
          the coupon discount of ₹${couponAmount} has been adjusted from your refund.\nThank you for your understanding and for shopping with us. 💙`;

          await Order.updateOne(
            {
              'orderDetails._id': orderId,
              'orderDetails.orderNumber': orderNumber,
            },
            {
              $set: {
                'orderDetails.$.couponAmountDeducted': true,
              },
              $inc: {
                'orderDetails.$.orderTotalAfterProductReturn': -finalRefund,
                'orderDetails.$.totalProducts': -1,
              },
            },
          );

          //refund details
          let refunded = {
            type: 'CREDIT',
            amount: finalRefund,
            description: `Order Item Cancel-Order ID:${detail.orderNumber}`,
            orderId: detail._id,
          };

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
                  note,
                'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
                  new Date(),
                'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
                  finalRefund,
                'orderDetails.$.orderItems.$[item].cancellation.requestReviewedDetails':
                  refunded,
              },
            },
            {
              arrayFilters: [
                { 'item.productId': productId, 'item.variantId': variantId },
              ],
            },
          );

          // 3️⃣ Restore stock
          await Products.updateOne(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.stockQuantity': product.quantity } },
          );

          //Credit refund amount to wallet
          await User.updateOne(
            { _id: userId },
            {
              $inc: { 'wallet.balance': finalRefund },
              $push: { 'wallet.transactions': refunded },
            },
          );

          await Order.updateOne(
            { userId, 'orderDetails._id': orderId },
            { $push: { 'orderDetails.$.refundTransactions': refunded } },
          );

          return { status, message };
        }
      } else if (detail.couponAmountDeducted) {
        ///////// Coupon amount already deducted ///////////

        message = 'Cancel request approved successfully!';
        status = 'success';

        const note = `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.
          \nThanks for shopping with us. 💙`;

        await Order.updateOne(
          {
            'orderDetails._id': orderId,
            'orderDetails.orderNumber': orderNumber,
          },
          {
            $inc: {
              'orderDetails.$.orderTotalAfterProductReturn': -refundAmount,
              'orderDetails.$.totalProducts': -1,
            },
          },
        );

        //refund details
        let refunded = {
          type: 'CREDIT',
          amount: refundAmount,
          description: `Order Item Cancel-Order ID:${detail.orderNumber}`,
          orderId: detail._id,
        };

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
                note,
              'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
                new Date(),
              'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
                refundAmount,
              'orderDetails.$.orderItems.$[item].cancellation.requestReviewedDetails':
                refunded,
            },
          },
          {
            arrayFilters: [
              { 'item.productId': productId, 'item.variantId': variantId },
            ],
          },
        );

        // 3️⃣ Restore stock
        await Products.updateOne(
          { _id: productId, 'variants._id': variantId },
          { $inc: { 'variants.$.stockQuantity': product.quantity } },
        );

        //Credit refund amount to wallet
        await User.updateOne(
          { _id: userId },
          {
            $inc: { 'wallet.balance': refundAmount },
            $push: { 'wallet.transactions': refunded },
          },
        );

        await Order.updateOne(
          { userId, 'orderDetails._id': orderId },
          { $push: { 'orderDetails.$.refundTransactions': refunded } },
        );

        return { status, message };
      }
    } else {
      ////// Coupon still valid → just cancel item and give refund//////
      message = 'Cancel request approved successfully!';
      status = 'success';

      const note = `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.
          \nThanks for shopping with us. 💙`;

      await Order.updateOne(
        {
          'orderDetails._id': orderId,
          'orderDetails.orderNumber': orderNumber,
        },
        {
          $inc: {
            'orderDetails.$.orderTotalAfterProductReturn': -refundAmount,
            'orderDetails.$.totalProducts': -1,
          },
        },
      );

      //refund details
      let refunded = {
        type: 'CREDIT',
        amount: refundAmount,
        description: `Order Item Cancel-Order ID:${detail.orderNumber}`,
        orderId: detail._id,
      };

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
              note,
            'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
              new Date(),
            'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
              refundAmount,
            'orderDetails.$.orderItems.$[item].cancellation.requestReviewedDetails':
              refunded,
          },
        },
        {
          arrayFilters: [
            { 'item.productId': productId, 'item.variantId': variantId },
          ],
        },
      );

      // 3️⃣ Restore stock
      await Products.updateOne(
        { _id: productId, 'variants._id': variantId },
        { $inc: { 'variants.$.stockQuantity': product.quantity } },
      );

      //Credit refund amount to wallet
      await User.updateOne(
        { _id: userId },
        {
          $inc: { 'wallet.balance': refundAmount },
          $push: { 'wallet.transactions': refunded },
        },
      );

      await Order.updateOne(
        { userId, 'orderDetails._id': orderId },
        { $push: { 'orderDetails.$.refundTransactions': refunded } },
      );

      return { status, message };
    }
  } else {
    /////////COUPON NOT APPLIED AT TIME OF CHECKOUT//////////
    message = 'Cancel request approved successfully!';
    status = 'success';

    const note = `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.
          \nThanks for shopping with us. 💙`;

    await Order.updateOne(
      {
        'orderDetails._id': orderId,
        'orderDetails.orderNumber': orderNumber,
      },
      {
        $inc: {
          'orderDetails.$.orderTotalAfterProductReturn': -refundAmount,
        },
      },
    );

    //refund details
    let refunded = {
      type: 'CREDIT',
      amount: refundAmount,
      description: `Order Item Cancel-Order ID:${detail.orderNumber}`,
      orderId: detail._id,
    };

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
            note,
          'orderDetails.$.orderItems.$[item].cancellation.requestedAt':
            new Date(),
          'orderDetails.$.orderItems.$[item].cancellation.refundAmount':
            refundAmount,
          'orderDetails.$.orderItems.$[item].cancellation.requestReviewedDetails':
            refunded,
        },
      },
      {
        arrayFilters: [
          { 'item.productId': productId, 'item.variantId': variantId },
        ],
      },
    );

    // 3️⃣ Restore stock
    await Products.updateOne(
      { _id: productId, 'variants._id': variantId },
      { $inc: { 'variants.$.stockQuantity': product.quantity } },
    );

    //Credit refund amount to wallet
    await User.updateOne(
      { _id: userId },
      {
        $inc: { 'wallet.balance': refundAmount },
        $push: { 'wallet.transactions': refunded },
      },
    );

    await Order.updateOne(
      { userId, 'orderDetails._id': orderId },
      { $push: { 'orderDetails.$.refundTransactions': refunded } },
    );

    return { status, message };
  }
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
  //console.log(updated.modifiedCount);
};

export default {
  fetchOrders,
  getByOrderNumber,
  increaseProductsQuantity,
  orderCancel,
  returnOrder,
  cancelItem,
  returnItem,
};
