import Coupons from '../../models/couponSchema.js';
import Cart from '../../models/cartSchema.js';
import Category from '../../models/categorySchema.js';
import Products from '../../models/productSchema.js';
import User from '../../models/userSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const fetchCoupons = async () => {
  return await Coupons.find({});
};

const findCoupon = async (couponId, userId) => {
  const isUserExists = await Coupons.findOne(
    { _id: couponId, 'usedBy.userId': userId },
    { 'usedBy.$': 1, _id: 0 },
  );

  if (isUserExists) {
    return isUserExists;
  } else {
    // Add new user to usedBy array
    const newUser = await Coupons.updateOne(
      { _id: couponId },
      { $push: { usedBy: { userId, usageCount: 1 } } },
    );

    return newUser;
  }
};

const couponUsageCount = async (couponId) => {
  return await Coupons.findOne({ _id: couponId });
};

const applyCoupon = async (userId, couponId, cartTotal) => {
  let coupon = await Coupons.findOne({ _id: couponId });
  let discountAmount = coupon.maxDiscountAmount;

  let minPurchaseAmount = coupon.minPurchaseAmount;

  let cartCheckoutItems = await Cart.findOne({ userId: userId });

  let allocatedDiscount;

  if (cartCheckoutItems.couponApplied.isApplied == false) {
    let remainingDiscount = discountAmount;

    let items = cartCheckoutItems.items;

    for (let index = 0; index < items.length; index++) {
      let item = items[index];

      if (index != items.length - 1) {
        let share = item.total / cartTotal;

        allocatedDiscount = Math.round(discountAmount * share);

        remainingDiscount -= allocatedDiscount;
      } else {
        allocatedDiscount = remainingDiscount;
      }
      let finalDiscountedPrice = item.total - allocatedDiscount;

      await Cart.updateOne(
        { userId: userId },
        {
          $set: {
            'items.$[elem].discount': allocatedDiscount,
            'items.$[elem].finalDiscountedPrice': finalDiscountedPrice,
          },
        },
        { arrayFilters: [{ 'elem._id': item._id }] },
      );
    }
    await Cart.updateOne(
      { userId: userId },
      {
        $set: {
          'couponApplied.isApplied': true,
          'couponApplied.couponId': couponId,
          'couponApplied.couponType': 'admin',
          'couponApplied.couponAmount': discountAmount,
          'couponApplied.minPurchaseAmount': minPurchaseAmount,
        },
      },
    );

    const isUserExists = await Coupons.findOne({
      _id: couponId,
      'usedBy.userId': userId,
    });

    if (isUserExists) {
      // Increment usageCount for existing user
      await Coupons.updateOne(
        { _id: couponId, 'usedBy.userId': userId },
        { $inc: { 'usedBy.$.usageCount': 1 } },
      );
    } else {
      // Add new user to usedBy array
      await Coupons.updateOne(
        { _id: couponId },
        { $push: { usedBy: { userId, usageCount: 1 } } },
      );
    }
  }
};

const removeCoupon = async (userId, couponId) => {
  const findCart = await Cart.findOne({ userId: userId });

  if (findCart.couponApplied.isApplied == true) {
    let items = findCart.items;

    for (let index = 0; index < items.length; index++) {
      let item = items[index];
      await Cart.updateOne(
        { userId: userId },
        {
          $unset: {
            'items.$[elem].discount': '',
            'items.$[elem].finalDiscountedPrice': '',
          },
        },
        { arrayFilters: [{ 'elem._id': item._id }] },
      );
    }

    await Cart.updateOne(
      { userId: userId },
      {
        $unset: {
          'couponApplied.couponId': '',
          'couponApplied.couponType': '',
          'couponApplied.couponAmount': '',
          'couponApplied.minPurchaseAmount': '',
        },
      },
    );

    await Cart.updateOne(
      { userId: userId },
      {
        $set: {
          'couponApplied.isApplied': false,
        },
      },
    );

    // Decrement usageCount when removing a coupon
    await Coupons.updateOne(
      { _id: couponId, 'usedBy.userId': userId },
      { $inc: { 'usedBy.$.usageCount': -1 } },
    );
  }
};

// FOR REFFERAL OR OTHER VALID COUPONS

const isAdminCoupon = async (couponCode) => {
  return await Coupons.findOne({ couponCode: couponCode });
};

const isReferralCoupon = async (userId, couponCode) => {
  return await User.findOne(
    {
      _id: userId,
      'referralCoupons.couponCode': couponCode,
    },
    { 'referralCoupons.$': 1, _id: 0 },
  );
};

const applyOtherCoupons = async (userId, couponCode, cartTotal, couponType) => {
  let coupon, discountAmount, minPurchaseAmount;
  if (couponType == 'admin') {
    coupon = await Coupons.findOne({ couponCode: couponCode });
    discountAmount = coupon.maxDiscountAmount;
    minPurchaseAmount = coupon.minPurchaseAmount;

    //adding coupon usage count
    const isUserExists = await Coupons.findOne({
      couponCode,
      'usedBy.userId': userId,
    });

    if (isUserExists) {
      // Increment usageCount for existing user
      await Coupons.updateOne(
        { couponCode, 'usedBy.userId': userId },
        { $inc: { 'usedBy.$.usageCount': 1 } },
      );
    } else {
      // Add new user to usedBy array
      await Coupons.updateOne(
        { couponCode },
        { $push: { usedBy: { userId, usageCount: 1 } } },
      );
    }
  } else if (couponType == 'referral') {
    coupon = await User.findOne({
      _id: userId,
      referralCoupons: { $elemMatch: { couponCode } },
    });
    let discount = coupon.referralCoupons
      .filter((item) => item.couponCode == couponCode)
      .map((x) => x.couponAmount);
    discountAmount = discount[0];

    let purchaseAmount = coupon.referralCoupons
      .filter((item) => item.couponCode == couponCode)
      .map((x) => x.minPurchaseAmount);
    minPurchaseAmount = purchaseAmount[0];
  }

  let cartCheckoutItems = await Cart.findOne({ userId: userId });

  let allocatedDiscount;

  if (cartCheckoutItems.couponApplied.isApplied == false) {
    let remainingDiscount = discountAmount;

    let items = cartCheckoutItems.items;

    for (let index = 0; index < items.length; index++) {
      let item = items[index];

      if (index != items.length - 1) {
        let share = item.total / cartTotal;

        allocatedDiscount = Math.round(discountAmount * share);

        remainingDiscount -= allocatedDiscount;
      } else {
        allocatedDiscount = remainingDiscount;
      }
      let finalDiscountedPrice = item.total - allocatedDiscount;

      await Cart.updateOne(
        { userId: userId },
        {
          $set: {
            'items.$[elem].discount': allocatedDiscount,
            'items.$[elem].finalDiscountedPrice': finalDiscountedPrice,
          },
        },
        { arrayFilters: [{ 'elem._id': item._id }] },
      );
    }
    await Cart.updateOne(
      { userId: userId },
      {
        $set: {
          'couponApplied.isApplied': true,
          'couponApplied.couponCode': couponCode,
          'couponApplied.couponType': couponType,
          'couponApplied.couponAmount': discountAmount,
          'couponApplied.minPurchaseAmount': minPurchaseAmount,
        },
      },
    );
    await User.updateOne(
      { _id: userId },
      { $set: { 'referralCoupons.$[elem].status': 'used' } },
      { arrayFilters: [{ 'elem.couponCode': couponCode }] },
    );
  }
};

const removeOtherCoupons = async (userId, couponCode) => {
  const findCart = await Cart.findOne({ userId: userId });

  const isAdminCoupon = async (couponCode) => {
    return await Coupons.findOne({ couponCode: couponCode });
  };

  if (isAdminCoupon) {
    // Decrement usageCount when removing a coupon
    await Coupons.updateOne(
      { couponCode, 'usedBy.userId': userId },
      { $inc: { 'usedBy.$.usageCount': -1 } },
    );
  }

  if (findCart.couponApplied.isApplied == true) {
    let items = findCart.items;

    for (let index = 0; index < items.length; index++) {
      let item = items[index];
      await Cart.updateOne(
        { userId: userId },
        {
          $unset: {
            'items.$[elem].discount': '',
            'items.$[elem].finalDiscountedPrice': '',
          },
        },
        { arrayFilters: [{ 'elem._id': item._id }] },
      );
    }

    await Cart.updateOne(
      { userId: userId },
      {
        $unset: {
          'couponApplied.couponCode': '',
          'couponApplied.couponType': '',
          'couponApplied.couponAmount': '',
          'couponApplied.minPurchaseAmount': '',
        },
      },
    );

    await Cart.updateOne(
      { userId: userId },
      {
        $set: {
          'couponApplied.isApplied': false,
        },
      },
    );
    await User.updateOne(
      { _id: userId },
      { $set: { 'referralCoupons.$[elem].status': 'active' } },
      { arrayFilters: [{ 'elem.couponCode': couponCode }] },
    );
  }
};

// FOR REFFERAL OR OTHER VALID COUPONS

export default {
  fetchCoupons,
  findCoupon,
  couponUsageCount,
  applyCoupon,
  removeCoupon,
  applyOtherCoupons,
  removeOtherCoupons,
  isAdminCoupon,
  isReferralCoupon,
};
