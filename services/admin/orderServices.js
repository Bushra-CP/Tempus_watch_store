const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const getOrders = async (search, status, sort, page, limit) => {
  let query = {};

  return await Order.aggregate([
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
  ]);
};

module.exports = { getOrders };
