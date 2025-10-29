import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import userProfileServices from '../../services/user/userProfileServices.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import cloudinary from '../../config/cloudinery.js';
import mongoose from 'mongoose';

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
      new mongoose.Types.ObjectId(userId),
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

    let updateProfile = { firstName, lastName, dob, phoneNo, gender };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tempus',
      });
      updateProfile.image = result.secure_url;
    }

    await userProfileServices.updateProfile(userId, updateProfile);

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
