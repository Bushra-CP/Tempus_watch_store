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
    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });
      // console.log(userData.firstName);
      return res.render('home', { user: userData });
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

    const { firstName, lastName, email, phoneNo, password } = req.body;

    // Check if user already exists
    const existingUser = await userServices.findUserByEmail(email);
    if (existingUser) {
      return res.redirect('/signup?message=User already exists!');
    }

    const otp = userServices.generateOtp();

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.userOtp = otp;
    req.session.userData = {
      firstName,
      lastName,
      email,
      phoneNo,
      hashedPassword,
    };
    console.log(`OTP sent:${otp}`);

    return res.redirect('/verifyOtp');
  } catch (error) {
    logger.error('Registration Error:', error);
    res.redirect('/signup?message=Something went wrong!');
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
      return res.redirect('login?message=User does not exist!');
    }
    if (user.isAdmin) {
      return res.redirect('login?message=Not authorized as user!');
    }

    if (user.isBlocked) {
      return res.redirect('login?message=User is blocked by admin!');
    }

    const isMatch = await userServices.validatePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      return res.redirect('login?message=Incorrect password!');
    }

    req.session.user = {
      _id: user._id,
      name: user.firstName,
      email: user.email,
    };

    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return res.redirect('login?message=Something went wrong!');
  }
};


const userDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });
      return res.render('userDashboard', { user: userData });
    } else {
      return res.render('userDashboard');
    }
  } catch (error) {
    logger.error('page not found');
    return res.redirect('/pageNotFound');
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error');
        return res.redirect('/pageNotFound');
      }
      res.redirect('/?message=Successfully logged out!');
    });
  } catch (error) {
    logger.error('page not found');
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
  userDashboard,
  logout,
};
