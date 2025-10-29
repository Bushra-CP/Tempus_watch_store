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
    returnAmount1 = 0,
    returnAmount2 = 0,
    returnAmount = 0,
    finalNetSales = 0,
    productDiscount = 0,
    couponDiscount = 0,
    totalDiscount = 0,
    quantity;

  for (let i = 0; i < orders.length; i++) {
    netSales += orders[i].orderDetails.orderTotal;

    if (
      orders[i].orderDetails.refundTransactions &&
      orders[i].orderDetails.refundTransactions.length > 0
    ) {
      returnAmount1 += orders[i].orderDetails.refundTransactions[0].amount;
    }
  }

  for (let i = 0; i < ordersList.length; i++) {
    let variant = ordersList[i].orderDetails.orderItems.variantId;
    quantity = ordersList[i].orderDetails.orderItems.quantity;

    let details = await getVariantDetails(variant);

    let actualPrice = details.variants[0].actualPrice;
    let offerPrice = details.variants[0].offerPrice;
    grossRevenue += actualPrice;
    postOffersRevenue += offerPrice;

    if (
      ordersList[i].orderDetails.orderItems.return.requestReviewedDetails &&
      ordersList[i].orderDetails.orderItems.return.requestReviewedDetails
        .type == 'CREDIT'
    ) {
      returnAmount2 += Number(
        ordersList[i].orderDetails.orderItems.return.requestReviewedDetails
          .amount,
      );
    }
  }

  grossRevenue = grossRevenue * quantity;
  postOffersRevenue = postOffersRevenue * quantity;

  returnAmount = returnAmount1 + returnAmount2;

  finalNetSales = netSales - returnAmount;

  productDiscount = grossRevenue - postOffersRevenue;
  couponDiscount = postOffersRevenue - netSales;
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
