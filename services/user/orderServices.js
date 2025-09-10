const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const getByOrderNumber = async (orderNumber) => {
  return await Order.findOne(
    { 'orderDetails.orderNumber': orderNumber },
    { _id: 0, 'orderDetails.$': 1 },
  );
};

module.exports = { getByOrderNumber };
