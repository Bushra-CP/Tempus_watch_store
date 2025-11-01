import User from '../../models/userSchema.js';
import logger from '../../utils/logger.js';

const getUser = async (userId) => {
  return await User.findById({ _id: userId });
};

const findUserByReferralCode = async (referralCode, signupData) => {
  let user = await User.findOne({ refferalCode: referralCode });
  if (user) {
    let couponDetails,
      buddyDetails = signupData;

    //CODE TO BLOCK ALREADY REFERRED USERS, WHO SIGNUP AGAIN USING REFERRRAL CODE- SCAM//
    // let alreadyReferred = user.referralCoupons.some(
    //   (coupon) => coupon.buddyEmail === buddyDetails.email,
    // );

    // if (!alreadyReferred) {
    //   const coupon = () => {
    //     const shortUUID = crypto.randomUUID().split('-')[0];
    //     return `TEMPUS-BUDDY-${user.firstName}-${shortUUID}`;
    //   };
    //   const couponCode = coupon();
    //   couponDetails = {
    //     couponCode,
    //     couponAmount: 500,
    //     minPurchaseAmount: 2000,
    //     earnedFrom: buddyDetails.firstName,
    //     buddyEmail: buddyDetails.email,
    //     issuedOn: new Date(),
    //   };
    // } else {
    //   couponDetails = {
    //     earnedFrom: 'User already referred',
    //     buddyEmail: buddyDetails.email,
    //     issuedOn: new Date(),
    //     status: 'Not Eligible',
    //   };
    // }
    //CODE TO BLOCK ALREADY REFERRED USERS, WHO SIGNUP AGAIN USING REFERRRAL CODE- SCAM//

    const coupon = () => {
      const shortUUID = crypto.randomUUID().split('-')[0];
      return `TEMPUS-BUDDY-${user.firstName}-${shortUUID}`;
    };
    const couponCode = coupon();

    couponDetails = {
      couponCode,
      couponAmount: 500,
      minPurchaseAmount: 2000,
      earnedFrom: buddyDetails.firstName,
      buddyEmail: buddyDetails.email,
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

export default { getUser, findUserByReferralCode };
