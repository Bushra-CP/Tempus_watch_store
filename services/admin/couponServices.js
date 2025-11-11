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
  return await Coupons.find(query).sort({ createdAt: -1 });
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

const normalizeCouponName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[‘’‛`']/g, '') // remove all types of apostrophes
    .replace(/\s+/g, ' '); // normalize spaces
};

const checkIfCouponNameExists = async (couponId = 0, couponCode) => {
  const normalizedInput = normalizeCouponName(couponCode);

  let couponNames;
  if (couponId) {
    couponNames = await Coupons.find({ _id: { $nin: [couponId] } });
  } else {
    couponNames = await Coupons.find();
  }

  const match = couponNames.find(
    (cat) => normalizeCouponName(cat.couponCode) === normalizedInput,
  );

  return match || null;
};

export default {
  addNewCoupon,
  fetchCoupons,
  editCoupon,
  removeCoupon,
  deactivateCoupon,
  activateCoupon,
  checkIfCouponNameExists,
};
