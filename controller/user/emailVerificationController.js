const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const userServices = require('../../services/user/userServices');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const env = require('dotenv').config();

const sendOtp = async (req, res) => {
  try {
    //console.log(req.session.user);
    const { email } = req.body;
    console.log(email);
    req.session.url = '/dashboard';
    req.session.email = email;

    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    //console.log('Saved OTP', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log(`OTP send:${otp}`);
      req.flash('success_msg', 'OTP send successfully!');

      return res.redirect('/verifyOtp');
    } else {
      req.flash('error_msg', 'Failed to send OTP. Try again!');
      return res.redirect('/dashboard');
    }
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

const changeEmailPage = async (req, res) => {
  try {
    //console.log(req.session.user);
    return res.render('changeEmail');
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

const changeEmail = async (req, res) => {
  try {

    console.log('req.session.email:', req.session.user);
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await userServices.findUserByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'Email already exists!');
      return res.redirect('/dashboard');
    }

    req.session.url = '/changeEmail';
    req.session.newEmail = email;
    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    console.log('Saved OTP', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log(`OTP send:${otp}`);
      req.flash('success_msg', 'OTP send successfully!');

      return res.redirect('/verifyOtp');
    } else {
      req.flash('error_msg', 'Failed to send OTP. Try again!');
      return res.redirect('/dashboard');
    }
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

// const saveNewEmail = async (req, res) => {
//   try {
//     let userId = req.session._id;
//     let newEmail = req.session.newEmail;
//     await userProfileServices.changeEmail(userId, newEmail);

//     req.session.destroy(() => {
//       return res.redirect('/login');
//     });
//   } catch (error) {
//     logger.error(error);
//     return res.redirect('/pageNotFound');
//   }
// };

module.exports = { sendOtp, changeEmailPage, changeEmail };
