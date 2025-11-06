import User from '../../models/userSchema.js';
import Order from '../../models/orderSchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import messages from '../../config/messages.js';
import mongoose from 'mongoose';

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
  if (status == 'delivered') {
    await Order.updateOne(
      { 'orderDetails._id': orderId },
      {
        $set: {
          'orderDetails.$.deliveryDate': new Date(),
        },
      },
    );
  }

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
  let message = '',
    status = '';

  const order = await Order.findOne({ 'orderDetails._id': orderId });

  const userId = order.userId;

  if (action === 'approve') {
    let notes = `₹We’ve successfully processed your return request.
    
    Thanks for shopping with us. 💙`;

    message = 'Return request approved successfully!';
    status = 'success';

    const finalRefund = refundAmount - 20;

    await Order.updateOne(
      { userId, 'orderDetails._id': orderId },
      {
        $set: {
          'orderDetails.$.status': 'returned',
          'orderDetails.$.return.returnStatus': 'returned',
          'orderDetails.$.return.additionalNotes': notes,
          'orderDetails.$.return.requestedAt': new Date(),
          'orderDetails.$.return.refundAmount': finalRefund,
        },
      },
    );

    const orderDetail = order.orderDetails.id(orderId);

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

    let refunded = {
      type: 'CREDIT',
      amount: finalRefund,
      description: 'Order return',
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
  } else if (action === 'reject') {
    const notes = '❌ Return rejected by admin';

    message = 'Return request rejected';
    status = 'error';

    await Order.updateOne(
      { userId, 'orderDetails._id': orderId },
      {
        $set: {
          'orderDetails.$.return.returnStatus': 'rejected',
          'orderDetails.$.return.additionalNotes': notes,
          'orderDetails.$.return.requestedAt': new Date(),
        },
      },
    );

    return { status, message };
  }
};

const handleProductRequest = async (
  orderId,
  productId,
  variantId,
  notes,
  action,
  refundAmount,
) => {
  //message variable to pass to admin
  let message = '',
    status = '';

  const order = await Order.findOne({ 'orderDetails._id': orderId });

  const userId = order.userId;

  const detail = order.orderDetails.id(orderId);

  const product = detail.orderItems.find(
    (item) =>
      item.productId.equals(productId) && item.variantId.equals(variantId),
  );
  const orderNumber = detail.orderNumber;

  if (action === 'approve') {
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

        message = 'Cancel request approved successfully!';
        status = 'success';

        const note = `We’ve successfully processed your cancellation request for ${product.productName} / ${detail.orderNumber}.
                \nSince this was the last or only item in your order, we’ve refunded the remaining order amount.\nThank you for shopping with us. 💙`;

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
          description: `Order Item Return-Order ID:${detail.orderNumber}`,
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
              'orderDetails.$.orderItems.$[item].return.returnStatus':
                'approved',
              'orderDetails.$.orderItems.$[item].return.additionalNotes': note,
              'orderDetails.$.orderItems.$[item].return.requestedAt':
                new Date(),
              'orderDetails.$.orderItems.$[item].return.refundAmount':
                finalRefund,
              'orderDetails.$.orderItems.$[item].return.requestReviewedDetails':
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
            const note = `❌ Return Blocked.
             This product value is less than the applied coupon discount of ₹${couponAmount}.
             Return request denied.`;

            message = `❌ Return Blocked.
             This product value is less than the applied coupon discount of ₹${couponAmount}.
             Return request denied.`;
            status = 'error';

            //  Update return status and details
            await Order.updateOne(
              {
                'orderDetails._id': orderId,
                'orderDetails.orderNumber': orderNumber,
                'orderDetails.orderItems.productId': productId,
                'orderDetails.orderItems.variantId': variantId,
              },
              {
                $set: {
                  'orderDetails.$.orderItems.$[item].return.returnStatus':
                    'rejected',
                  'orderDetails.$.orderItems.$[item].return.additionalNotes':
                    note,
                  'orderDetails.$.orderItems.$[item].return.requestedAt':
                    new Date(),
                  'orderDetails.$.orderItems.$[item].return.refundAmount': 0,
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

            message = `Return request approved successfully!
              \nSince a coupon was applied during purchase, and the return lowers your order value below the eligible amount, 
              the coupon discount of ₹${couponAmount} has been adjusted from refund.`;
            status = 'success';

            const note = `We’ve successfully processed your return request for ${product.productName} / ${detail.orderNumber}.
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
              description: `Order Item return-Order ID:${detail.orderNumber}`,
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
                  'orderDetails.$.orderItems.$[item].return.returnStatus':
                    'approved',
                  'orderDetails.$.orderItems.$[item].return.additionalNotes':
                    note,
                  'orderDetails.$.orderItems.$[item].return.requestedAt':
                    new Date(),
                  'orderDetails.$.orderItems.$[item].return.refundAmount':
                    finalRefund,
                  'orderDetails.$.orderItems.$[item].return.requestReviewedDetails':
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

          message = 'Return request approved successfully!';
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
            description: `Order Item return-Order ID:${detail.orderNumber}`,
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
                'orderDetails.$.orderItems.$[item].return.returnStatus':
                  'approved',
                'orderDetails.$.orderItems.$[item].return.additionalNotes':
                  note,
                'orderDetails.$.orderItems.$[item].return.requestedAt':
                  new Date(),
                'orderDetails.$.orderItems.$[item].return.refundAmount':
                  refundAmount,
                'orderDetails.$.orderItems.$[item].return.requestReviewedDetails':
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
        message = 'Return request approved successfully!';
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
          description: `Order Item return-Order ID:${detail.orderNumber}`,
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
              'orderDetails.$.orderItems.$[item].return.returnStatus':
                'approved',
              'orderDetails.$.orderItems.$[item].return.additionalNotes': note,
              'orderDetails.$.orderItems.$[item].return.requestedAt':
                new Date(),
              'orderDetails.$.orderItems.$[item].return.refundAmount':
                refundAmount,
              'orderDetails.$.orderItems.$[item].return.requestReviewedDetails':
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
      message = 'Return request approved successfully!';
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
        description: `Order Item return-Order ID:${detail.orderNumber}`,
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
            'orderDetails.$.orderItems.$[item].return.returnStatus': 'approved',
            'orderDetails.$.orderItems.$[item].return.additionalNotes': note,
            'orderDetails.$.orderItems.$[item].return.requestedAt': new Date(),
            'orderDetails.$.orderItems.$[item].return.refundAmount':
              refundAmount,
            'orderDetails.$.orderItems.$[item].return.requestReviewedDetails':
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
  } else if (action === 'reject') {
    const note = `❌ Return Blocked.
             Return request rejected by admin.`;

    message = '❌ Return rejected!';
    status = 'success';

    //  Update return status and details
    await Order.updateOne(
      {
        'orderDetails._id': orderId,
        'orderDetails.orderNumber': orderNumber,
        'orderDetails.orderItems.productId': productId,
        'orderDetails.orderItems.variantId': variantId,
      },
      {
        $set: {
          'orderDetails.$.orderItems.$[item].return.returnStatus': 'rejected',
          'orderDetails.$.orderItems.$[item].return.returnReason': notes,
          'orderDetails.$.orderItems.$[item].return.additionalNotes': note,
          'orderDetails.$.orderItems.$[item].return.requestedAt': new Date(),
          'orderDetails.$.orderItems.$[item].return.refundAmount': 0,
        },
      },
      {
        arrayFilters: [
          { 'item.productId': productId, 'item.variantId': variantId },
        ],
      },
    );

    return { status, message };
  }
};

export default {
  getOrders,
  updateOrderStatus,
  getByOrderId,
  handleOrderRequest,
  handleProductRequest,
};
