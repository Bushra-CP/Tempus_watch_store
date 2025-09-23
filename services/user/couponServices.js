const Coupons = require('../../models/couponSchema');
const Category = require('../../models/categorySchema');
const Products = require('../../models/productSchema');
const User = require('../../models/userSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const fetchCoupons = async () => {
  return await Coupons.find({});
};

module.exports = {fetchCoupons};
