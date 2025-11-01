import User from '../../models/userSchema.js';
import Order from '../../models/orderSchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';
import moment from 'moment';

const getOrders = async (page, limit) => {
  const skip = (page - 1) * limit;

  const orders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $unwind: '$orderDetails.orderItems' },
    { $skip: skip },
    { $limit: limit },
  ]);

  // Total count for pagination
  const totalOrders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $unwind: '$orderDetails.orderItems' },
    { $unwind: '$variantDetails' },
    { $count: 'total' },
  ]);

  const total = totalOrders[0] ? totalOrders[0].total : 0;

  return { orders, total };
};

const getVariantDetails = async (variantId) => {
  return await Products.findOne(
    { 'variants._id': variantId },
    { _id: 0, 'variants.$': 1 },
  );
};

const getSalesReport = async (type, startDate, endDate) => {
  let match = { 'orderDetails.status': { $ne: 'failed' } };

  let start, end;

  if (type === 'daily') {
    start = moment().startOf('day').toDate();
    end = moment().endOf('day').toDate();
  } else if (type === 'weekly') {
    start = moment().startOf('isoWeek').toDate();
    end = moment().endOf('isoWeek').toDate();
  } else if (type === 'monthly') {
    start = moment().startOf('month').toDate();
    end = moment().endOf('month').toDate();
  } else if (type === 'custom' && startDate && endDate) {
    start = moment(startDate).startOf('day').toDate();
    end = moment(endDate).endOf('day').toDate();
  }

  if (start && end) {
    match['orderDetails.orderDate'] = { $gte: start, $lte: end };
  }

  const orders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $match: match },
  ]);

  let totalOrders = orders.length;

  const ordersList = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $match: match },
    { $unwind: '$orderDetails.orderItems' },
  ]);

  let grossRevenue = 0,
    postOffersRevenue = 0,
    netSales = 0,
    returnAmount = 0,
    finalNetSales = 0,
    productDiscount = 0,
    couponDiscount = 0,
    totalDiscount = 0;

  for (let i = 0; i < orders.length; i++) {
    netSales += orders[i].orderDetails.orderTotal;

    if (
      orders[i].orderDetails.refundTransactions &&
      orders[i].orderDetails.refundTransactions.length > 0
    ) {
      returnAmount += Number(
        orders[i].orderDetails.refundTransactions[0].amount,
      );
      couponDiscount += Number(
        orders[i].orderDetails.couponApplied.couponAmount,
      );
      console.log(orders[i].orderDetails.refundTransactions[0].amount);
    }
  }

  for (let i = 0; i < ordersList.length; i++) {
    const orderItems = ordersList[i].orderDetails.orderItems;

    // Handle both single-item and multi-item orders
    const itemsArray = Array.isArray(orderItems) ? orderItems : [orderItems];

    for (const item of itemsArray) {
      const variantId = item.variantId;
      const quantity = item.quantity;

      const details = await getVariantDetails(variantId);
      if (!details || !details.variants || !details.variants[0]) {
        console.warn(`Variant not found for ID: ${variantId}`);
        continue;
      }

      const actualPrice = details.variants[0].actualPrice || 0;
      const offerPrice = details.variants[0].offerPrice || 0;

      // ✅ Multiply by quantity 
      grossRevenue += actualPrice * quantity;
      postOffersRevenue += offerPrice * quantity;
    }
  }

  finalNetSales = netSales - returnAmount;

  productDiscount = grossRevenue - postOffersRevenue;
  totalDiscount = productDiscount + couponDiscount;

  let summary = {
    totalOrders,
    grossRevenue,
    postOffersRevenue,
    productDiscount,
    couponDiscount,
    totalDiscount,
    netSales,
    returnAmount,
    finalNetSales,
  };
  //console.log(summary);
  return { orders, summary };
};

export default { getOrders, getVariantDetails, getSalesReport };
