const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const userServices = require('../../services/user/userServices');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const env = require('dotenv').config();

const pageNotFound = async (req, res) => {
  try {
    res.render('page404');
  } catch (error) {
    logger.error('Error rendering 404 page: ', error);
    res.status(500).send('Error loading 404 page');
  }
};

const loadHomePage = async (req, res) => {
  try {
    // req.session.cartAddress='/cart';
    const user = req.session.user;

    if (user) {
      let userData = await User.findOne({ _id: user._id });
      // console.log(userData.firstName);
      return res.render('home', {
        user: userData,
        search: req.query.search || '',
      });
    } else {
      return res.render('home');
    }
  } catch (error) {
    logger.error('Home page not found');
    return res.redirect('/pageNotFound');
  }
};

const userSignup = async (req, res) => {
  try {
    return res.render('userSignup');
  } catch (error) {
    logger.error('Signup page not found');
    return res.redirect('/pageNotFound');
  }
};

const registerUser = async (req, res) => {
  try {
    logger.info('Incoming form data:', req.body);

    const { firstName, lastName, email, phoneNo, password, referralCode } =
      req.body;

    // Check if user already exists
    const existingUser = await userServices.findUserByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'User already exists!');
      return res.redirect('/signup');
    }

    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    console.log('Saved OTP document:', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.userData = {
      firstName,
      lastName,
      email,
      phoneNo,
      hashedPassword,
    };
    req.session.referralCode = referralCode;
    console.log(`OTP sent:${otp}`);

    return res.redirect('/verifyOtp');
  } catch (error) {
    logger.error('Registration Error:', error);
    req.flash('error_msg', 'Something went wrong!');
    res.redirect('/signup');
  }
};

const userLogin = async (req, res) => {
  try {
    return res.render('userLogin');
  } catch (error) {
    logger.error('Login page not found');
    return res.redirect('/pageNotFound');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
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

    const isMatch = await userServices.validatePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      req.flash('error_msg', 'Incorrect password!');
      return res.redirect('/login');
    }

    req.session.user = {
      _id: user._id,
      name: user.firstName,
      email: user.email,
    };

    if (req.session.url == '/dashboard/editPassword') {
      return res.redirect('/dashboard');
    }
    if (req.session.cartUrl) {
      return res.redirect(req.session.cartUrl);
    }
    if (req.session.cartAddress == '/cart') {
      return res.redirect('/cart');
    }
    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'Something went wrong!');
    return res.redirect('login');
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error:', err);
        return res.redirect('/pageNotFound');
      }
      res.clearCookie('connect.sid'); // remove session cookie
      return res.redirect('/');
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.redirect('/pageNotFound');
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
  userSignup,
  registerUser,
  userLogin,
  login,
  logout,
};
