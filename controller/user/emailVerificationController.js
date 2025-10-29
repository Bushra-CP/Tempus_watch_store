import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import userServices from '../../services/user/userServices.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const sendOtp = async (req, res) => {
  try {
    //console.log(req.session.user);
    const { email } = req.body;
    //console.log(email);
    req.session.url = '/dashboard';

    const user = req.session.user;
    const sessionEmail = user.email;

    if (sessionEmail != email) {
      req.flash('error_msg', 'Email does not match!');
      return res.redirect('/dashboard');
    }

    req.session.email = email;

    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    //console.log('Saved OTP', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log(`OTP send:${otp}`);
      req.flash('success_msg', 'OTP send successfully!');

      return res.redirect('/verifyOtp?new=true');
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

      return res.redirect('/verifyOtp?new=true');
    } else {
      req.flash('error_msg', 'Failed to send OTP. Try again!');
      return res.redirect('/dashboard');
    }
  } catch (error) {
    logger.error(error);
    return res.redirect('/pageNotFound');
  }
};

export default { sendOtp, changeEmailPage, changeEmail };
