import Coupons from '../../models/couponSchema.js';
import Category from '../../models/categorySchema.js';
import Products from '../../models/productSchema.js';
import User from '../../models/userSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const addNewCoupon = async (
  couponCode,
  discountType,
  discountValue,
  minPurchaseAmount,
  maxDiscountAmount,
  usageLimit,
  perUserLimit,
  validFrom,
  validUntil,
  description,
) => {
  let newCoupon = new Coupons({
    couponCode,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    perUserLimit,
    validFrom,
    validUntil,
    description,
  });
  return await newCoupon.save();
};

const fetchCoupons = async (search) => {
  let query = {};
  if (search) {
    query = { couponCode: { $regex: search, $options: 'i' } };
  }
  return await Coupons.find(query);
};

const editCoupon = async (
  couponId,
  couponCode,
  discountType,
  discountValue,
  minPurchaseAmount,
  maxDiscountAmount,
  usageLimit,
  perUserLimit,
  validFrom,
  validUntil,
  description,
) => {
  let editData = {
    couponCode,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    perUserLimit,
    validFrom,
    validUntil,
    description,
  };
  return await Coupons.updateOne({ _id: couponId }, { $set: editData });
};

const removeCoupon = async (couponId) => {
  return await Coupons.deleteOne({ _id: couponId });
};

const deactivateCoupon = async (couponId) => {
  await Coupons.updateOne({ _id: couponId }, { $set: { status: 'DISABLED' } });
};

const activateCoupon = async (couponId) => {
  return await Coupons.updateOne(
    { _id: couponId },
    { $set: { status: 'ACTIVE' } },
  );
};

export default {
  addNewCoupon,
  fetchCoupons,
  editCoupon,
  removeCoupon,
  deactivateCoupon,
  activateCoupon,
};
