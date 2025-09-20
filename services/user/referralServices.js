const User = require('../../models/userSchema');
const logger = require('../../utils/logger');

const getUser = async (userId) => {
  return await User.findById({ _id: userId });
};

const findUserByReferralCode = async (referralCode, signupData) => {
  let user = await User.findOne({ refferalCode: referralCode });
  if (user) {
    let buddyDetails = signupData;
    const coupon = () => {
      const shortUUID = crypto.randomUUID().split('-')[0];
      return `TEMPUS-BUDDY-${user.firstName}-${shortUUID}`;
    };
    const couponCode = coupon();
    let couponDetails = {
      couponCode,
      couponAmount: 1000,
      earnedFrom: buddyDetails.firstName,
      issuedOn: new Date(),
    };

    await User.updateOne(
      { _id: user._id },
      {
        $push: { referralCoupons: couponDetails },
      },
    );
  }
};

module.exports = { getUser, findUserByReferralCode };
