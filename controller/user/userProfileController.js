import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import userProfileServices from '../../services/user/userProfileServices.js';
import bcrypt from 'bcrypt';
import cloudinary from '../../config/cloudinery.js';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';

const userDashboard = async (req, res) => {
  try {
    let userId = req.session.user._id;
    const user = req.session.user;
    req.session.url = 'dashboard';
    if (!user) {
      req.flash('error_msg', 'Please log in to view your profile.');
      return res.redirect('/login');
    }

    const userData = await User.findById(user._id);

    if (!userData) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/login');
    }

    let userInfo = await userProfileServices.getUser(userId);

    //console.log(userInfo);

    let userAddresses = await userProfileServices.getUserAddresses(
      new mongoose.Types.ObjectId(String(userId)),
    );

    let wallet = userData.wallet.transactions.sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    //console.log(wallet);

    let referrals = userData.referralCoupons.sort(
      (a, b) => b.issuedOn - a.issuedOn,
    );

    return res.render('userProfile', {
      user: userData,
      userInfo,
      userAddresses,
      wallet,
      referrals,
    });
  } catch (error) {
    logger.error('Error loading user dashboard:', error);
    return res.redirect('/pageNotFound');
  }
};

const editProfile = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = req.params.id;
    const { firstName, lastName, dob, phoneNo, gender } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (
      !firstName ||
      typeof firstName !== 'string' ||
      firstName.trim() === ''
    ) {
      req.flash('error_msg', messages.FIRST_NAME_ERROR);
      return res.redirect('/dashboard');
    }

    if (typeof lastName !== 'string') {
      req.flash('error_msg', messages.LAST_NAME_ERROR2);
      return res.redirect('/dashboard');
    }

    const dobDate = new Date(dob);

    if (isNaN(dobDate)) {
      req.flash('error_msg', messages.DOB_ERROR); // Invalid date
      return res.redirect('/dashboard');
    }

    // Calculate age
    const ageDifMs = Date.now() - dobDate.getTime();
    const ageDate = new Date(ageDifMs); // milliseconds from epoch
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 15) {
      req.flash('error_msg', 'You are not age-appropriate.');
      return res.redirect('/dashboard');
    }

    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
      req.flash('error_msg', messages.PHONE_NO_ERROR);
      return res.redirect('/dashboard');
    }

    ////////*/FORM VALIDATION/*////////

    let updateProfile = { firstName, lastName, dob, phoneNo, gender };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tempus',
      });
      updateProfile.image = result.secure_url;
    }

    await userProfileServices.updateProfile(userId, updateProfile);

    req.flash('success_msg', messages.PROFILE_EDITED);
    return res.redirect('/dashboard');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const changePassword = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = req.query.userId;
    const { currentPswd, newPswd } = req.body;

    const passwordCheck = await userProfileServices.confirmPassword(
      userId,
      currentPswd,
    );

    if (!passwordCheck) {
      req.flash('error_msg', 'Your current password does not match');
      return res.redirect('/dashboard');
    } else {
      const hashedNewPassword = await bcrypt.hash(newPswd, 10);

      await userProfileServices.changePassword(userId, hashedNewPassword);

      req.session.url = req.path;
      console.log(req.session.url);
      req.flash(
        'success_msg',
        'Your password updated successfully! Please login...',
      );
      req.session.destroy(() => {
        return res.redirect('/login');
      });
    }
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

export default {
  userDashboard,
  editProfile,
  changePassword,
};
