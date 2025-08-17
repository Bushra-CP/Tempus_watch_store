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

    if (otp == req.session.userOtp) {
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
      return res.redirect('/login?message=Registered successfully! Login now');
    } else {
      return res.redirect('/verifyOtp?message=Invalid OTP. Please try again.');
    }
  } catch (error) {
    console.error(error);
    return res.redirect(
      '/signup?message=Something went wrong. Please try again.',
    );
  }
};

const resendOtp = async (req, res) => {
  console.log(req.session.userData);
  try {
    const { email } = req.session.userData;
    if (!email) {
      return res.redirect('/signup?message=Email not found. Please try again.');
    }
    const otp = userServices.generateOtp();
    req.session.userOtp = otp;
    const emailSent = await userServices.sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log(`Resend otp:${otp}`);
      return res.redirect('/verifyOtp?message=OTP resend successfully');
    } else {
      return res.redirect('/signup?message=Failed to resend OTP. Try again');
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

    const otp = userServices.generateOtp();
    req.session.userOtp = otp;
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
    console.log('Password changed successfully!');

    // Success
    return res.redirect('/login?message=Password Changed! Login now');
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
