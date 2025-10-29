import logger from '../../utils/logger.js';
import messages from '../../config/messages.js';
import couponServices from '../../services/user/couponServices.js';
import cartServices from '../../services/user/cartServices.js';
import session from 'express-session';
import mongoose from 'mongoose';

const applyCoupon = async (req, res) => {
  try {
    let { couponId, cartTotal } = req.body;
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);
    couponId = new mongoose.Types.ObjectId(couponId);

    const couponUsed = await couponServices.findCoupon(couponId, userId);
    const usageCount = couponUsed.usedBy[0].usageCount;

    const couponUsageCount = await couponServices.couponUsageCount(couponId);

    const userLimit = couponUsageCount.perUserLimit;

    // if (usageCount > userLimit) {
    //   return res.json({
    //     success: false,
    //     message: 'Coupon Usage limit exceeded!',
    //     redirect: req.session.couponUrl,
    //   });
    // } else {
    //   await couponServices.applyCoupon(userId, couponId, cartTotal);
    //   return res.json({
    //     success: true,
    //     message: 'Coupon Applied!',
    //     redirect: req.session.couponUrl,
    //   });
    // }

    await couponServices.applyCoupon(userId, couponId, cartTotal);
    return res.json({
      success: true,
      message: 'Coupon Applied!',
      redirect: req.session.couponUrl,
    });
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

const removeCoupon = async (req, res) => {
  try {
    let { couponId } = req.body;
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);
    couponId = new mongoose.Types.ObjectId(couponId);

    await couponServices.removeCoupon(userId, couponId);

    return res.json({
      success: true,
      message: 'Coupon Removed!',
      redirect: req.session.couponUrl,
    });
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

// FOR REFFERAL OR OTHER VALID COUPONS
const applyOtherCoupons = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);
    //console.log(req.body);
    const { couponCode, cartTotal } = req.body;

    if (!couponCode) {
      return res.json({
        success: false,
        message: 'Enter a valid code!',
        redirect: req.session.couponUrl,
      });
    }

    let couponType = '';

    const isAdminCoupon = await couponServices.isAdminCoupon(couponCode);
    const isReferralCoupon = await couponServices.isReferralCoupon(
      userId,
      couponCode,
    );

    if (isAdminCoupon) {
      if (isAdminCoupon.minPurchaseAmount > cartTotal) {
        return res.json({
          success: false,
          message: 'Cannot apply this coupon!',
          redirect: req.session.couponUrl,
        });
      }
      couponType = 'admin';
    } else if (isReferralCoupon) {
      if (isReferralCoupon.referralCoupons[0].status == 'used') {
        return res.json({
          success: false,
          message: 'This coupon is already used!',
          redirect: req.session.couponUrl,
        });
      }

      if (isReferralCoupon.couponAmount > cartTotal) {
        return res.json({
          success: false,
          message: 'Cannot apply this coupon!',
          redirect: req.session.couponUrl,
        });
      }
      if (cartTotal < 2000) {
        return res.json({
          success: false,
          message: 'Minimum order amount is 2000 to use referral coupons!',
          redirect: req.session.couponUrl,
        });
      }
      couponType = 'referral';
    } else {
      return res.json({
        success: false,
        message: 'Not valid coupon!',
        redirect: req.session.couponUrl,
      });
    }

    await couponServices.applyOtherCoupons(
      userId,
      couponCode,
      cartTotal,
      couponType,
    );
    return res.json({
      success: true,
      message: 'Coupon Applied!',
      redirect: req.session.couponUrl,
    });
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

const removeOtherCoupons = async (req, res) => {
  try {
    //console.log(req.body);
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);

    const { couponCode } = req.body;

    await couponServices.removeOtherCoupons(userId, couponCode);

    return res.json({
      success: true,
      message: 'Coupon Removed!',
      redirect: req.session.couponUrl,
    });
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};
// FOR REFFERAL OR OTHER VALID COUPONS

export default {
  applyCoupon,
  removeCoupon,
  applyOtherCoupons,
  removeOtherCoupons,
};
