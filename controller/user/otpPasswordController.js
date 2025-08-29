const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const userServices = require('../../services/user/userServices');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const env = require('dotenv').config();

const verifyOtpPage = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });
      return res.render('verifyOtp', { user: userData });
    } else {
      return res.render('verifyOtp');
    }
  } catch (error) {
    logger.error('Page not found');
    return res.redirect('/pageNotFound');
  }
};

const verifyOtpFunction = async (req, res) => {
  try {
    const otp = req.body.otp;

    const getOTP = await userServices.findByOTP(otp);

    if (otp == getOTP.otp) {
      if (req.session.url == '/forgotPasswordOtp') {
        console.log(req.session.email);
        return res.redirect('/changeForgotPswdPage');
      }
      let signupData = req.session.userData;

      await userServices.createUser(signupData);
      logger.info('User created successfully!');

      // req.session.userOtp = null;
      // req.session.userData = null;

      // Success
      req.flash('success_msg', 'Registered successfully! Login now!');
      return res.redirect('/login');
    } else {
      req.flash('error_msg', 'Invalid OTP. Please try again!');
      return res.redirect('/verifyOtp');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong. Please try again!');
    return res.redirect('/signup');
  }
};

const resendOtp = async (req, res) => {
  const email = req.session.userData?.email || req.session.email;

  console.log(email);
  try {
    // const { email } = req.session.userData;
    // console.log(email);
    if (!email) {
      req.flash('error_msg', 'Email not found. Please try again!');
      return res.redirect('/signup');
    }
    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    console.log('Saved OTP document:', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log(`Resend otp:${otp}`);
      req.flash('success_msg', 'OTP resend successfully!');
      return res.redirect('/verifyOtp');
    } else {
      req.flash('error_msg', 'Failed to resend OTP. Try again!');
      return res.redirect('/signup');
    }
  } catch (error) {
    console.log('Error sending OTP');
    res.status(500).send('server error');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });
      return res.render('forgotPassword', { user: userData });
    } else {
      return res.render('forgotPassword');
    }
  } catch (error) {
    logger.error('page not found');
    return res.redirect('/pageNotFound');
  }
};

const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    req.session.url = req.url;
    req.session.email = email;

    const user = await userServices.findUserByEmail(email);
    if (!user) {
      req.flash('error_msg', 'User does not exist!');
      return res.redirect('/login');
    }
    if (user.isAdmin) {
      req.flash('error_msg', 'Not authorized as user!');
      return res.redirect('/login');
    }

    if (user.isBlocked) {
      req.flash('error_msg', 'User is blocked by admin!');
      return res.redirect('/login');
    }

    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    console.log('Saved OTP document:', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    console.log(`OTP sent:${otp}`);
    console.log(`url: ${req.url}`);

    return res.redirect('/verifyOtp');
  } catch (error) {
    logger.error('page not found');
    return res.redirect('/pageNotFound');
  }
};

const changeForgotPasswordPage = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });
      return res.render('changeForgotPassword', { user: userData });
    } else {
      return res.render('changeForgotPassword');
    }
  } catch (error) {
    logger.error('page not found');
    return res.redirect('/pageNotFound');
  }
};

const changeForgotPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);

    let email = req.session.email;
    console.log(email);
    await userServices.changePassword(email, hashedPassword);
    //console.log('Password changed successfully!');

    // Success
    req.flash('success_msg', 'Password Changed! Login now!');
    return res.redirect('/login');
  } catch (error) {
    logger.error('page not found');
    return res.redirect('/pageNotFound');
  }
};

module.exports = {
  verifyOtpPage,
  verifyOtpFunction,
  resendOtp,
  forgotPassword,
  forgotPasswordOtp,
  changeForgotPasswordPage,
  changeForgotPassword,
};
