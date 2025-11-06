import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import userServices from '../../services/user/userServices.js';
import productDetailsServices from '../../services/user/productDetailsServices.js';
import productListingServices from '../../services/user/productListingServices.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import messages from '../../config/messages.js';

dotenv.config();

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

    const brandNames = await userServices.brandNames();

    const brands = brandNames[0].BrandNames;

    const categoryData = await userServices.categories();

    const categories = categoryData[0].categoryData;

    const latestProducts = await productDetailsServices.latestProducts();

    if (user) {
      let userData = await User.findOne({ _id: user._id });
      // console.log(userData.firstName);
      return res.render('home', {
        user: userData,
        search: req.query.search || '',
        brands,
        categories,
        latestProducts,
      });
    } else {
      return res.render('home', { brands, categories, latestProducts });
    }
  } catch (error) {
    logger.error('Home page not found');
    return res.redirect('/pageNotFound');
  }
};

const userSignup = async (req, res) => {
  try {
    req.session.signupUrl = '/signup';
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

    ////////*/FORM VALIDATION/*////////

    if (
      !firstName ||
      typeof firstName !== 'string' ||
      firstName.trim() === ''
    ) {
      req.flash('error_msg', messages.FIRST_NAME_ERROR);
      return res.redirect('/signup');
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      req.flash('error_msg', messages.LAST_NAME_ERROR);
      return res.redirect('/signup');
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      req.flash('error_msg', messages.EMAIL_ERROR2);
      return res.redirect('/signup');
    }

    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
      req.flash('error_msg', messages.PHONE_NO_ERROR);
      return res.redirect('/signup');
    }

    if (
      !password ||
      typeof password !== 'string' ||
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      req.flash('error_msg', messages.PASSWORD_ERROR2);
      return res.redirect('/signup');
    }

    if (referralCode && typeof referralCode !== 'string') {
      req.flash('error_msg', messages.REFERRAL_CODE_ERROR);
      return res.redirect('/signup');
    }

    ////////*/FORM VALIDATION/*////////

    // Check if user already exists
    const existingUser = await userServices.findUserByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'User already exists!');
      return res.redirect('/signup');
    }

    const otp = userServices.generateOtp();

    const savedOtp = await userServices.storeOTP(email, otp);
    //console.log('Saved OTP document:', savedOtp);

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.url = '/signup';

    req.session.userData = {
      firstName,
      lastName,
      email,
      phoneNo,
      hashedPassword,
    };
    req.session.referralCode = referralCode;
    console.log(`OTP sent:${otp}`);

    return res.redirect('/verifyOtp?new=true');
  } catch (error) {
    logger.error('Registration Error:', error);
    req.flash('error_msg', 'Something went wrong!');
    res.redirect('/signup');
  }
};

const userLogin = async (req, res) => {
  try {
    req.session.signupUrl = '/login';
    return res.render('userLogin');
  } catch (error) {
    logger.error('Login page not found');
    return res.redirect('/pageNotFound');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (!email || !password) {
      req.flash('error_msg', messages.EMAIL_PASSWORD_ERROR);
      return res.redirect('/login');
    }

    if (!email) {
      req.flash('error_msg', messages.EMAIL_ERROR);
      return res.redirect('/login');
    }

    if (!password) {
      req.flash('error_msg', messages.PASSWORD_ERROR);
      return res.redirect('/login');
    }

    ////////*/FORM VALIDATION/*////////

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
      phoneNo: user.phoneNo,
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

const aboutUs = async (req, res) => {
  try {
    res.render('aboutUs');
  } catch (error) {
    logger.error('Logout error:', error);
    return res.redirect('/pageNotFound');
  }
};

const contactUs = async (req, res) => {
  try {
    res.render('contactUs');
  } catch (error) {
    logger.error('Logout error:', error);
    return res.redirect('/pageNotFound');
  }
};

const sendMessage = async (req, res) => {
  try {
    const { fname, lname, email, message } = req.body;

    await userServices.sendMessage(fname, lname, email, message);

          req.flash('success_msg', messages.CONTACT_FORM_SAVED);
      return res.redirect('/contactUs');

  } catch (error) {
    logger.error('Logout error:', error);
    return res.redirect('/pageNotFound');
  }
};

export default {
  loadHomePage,
  pageNotFound,
  userSignup,
  registerUser,
  userLogin,
  login,
  logout,
  aboutUs,
  contactUs,
  sendMessage,
};
