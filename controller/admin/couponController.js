const logger = require('../../utils/logger');
const messages = require('../../config/messages');
const couponServices = require('../../services/admin/couponServices');
const session = require('express-session');
const mongoose = require('mongoose');
const { remove } = require('winston');

const couponPage = async (req, res) => {
  try {
    let search = req.query.search || '';
    let coupons = await couponServices.fetchCoupons(search);
    //console.log(coupons);
    res.render('coupons', { coupons, search });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addNewCoupon = async (req, res) => {
  try {
    //console.log(req.body);
    let {
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
    } = req.body;
    await couponServices.addNewCoupon(
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
    );
    req.flash('success_msg', messages.COUPON_ADDED);
    res.redirect('/admin/coupons');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editCoupon = async (req, res) => {
  try {
    //console.log(req.body);
    let {
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
    } = req.body;
    await couponServices.editCoupon(
      new mongoose.Types.ObjectId(couponId),
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
    );
    req.flash('success_msg', messages.COUPON_EDITED);
    res.redirect('/admin/coupons');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const removeCoupon = async (req, res) => {
  try {
    //console.log(req.body);
    let { couponId } = req.body;
    await couponServices.removeCoupon(new mongoose.Types.ObjectId(couponId));

    res.json({
      success: true,
      redirect: '/admin/coupons',
      message: messages.COUPON_DELETED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const deactivateCoupon = async (req, res) => {
  try {
    //console.log(req.body);
    let { couponId } = req.body;
    couponId = new mongoose.Types.ObjectId(couponId);

    await couponServices.deactivateCoupon(couponId);

    res.json({
      success: true,
      redirect: '/admin/coupons',
      message: messages.COUPON_DEACTIVATED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const activateCoupon = async (req, res) => {
  try {
    //console.log(req.body);
    let { couponId } = req.body;
    couponId = new mongoose.Types.ObjectId(couponId);

    await couponServices.activateCoupon(couponId);

    res.json({
      success: true,
      redirect: '/admin/coupons',
      message: messages.COUPON_ACTIVATED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  couponPage,
  addNewCoupon,
  editCoupon,
  removeCoupon,
  activateCoupon,
  deactivateCoupon,
};
