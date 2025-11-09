import logger from '../../utils/logger.js';
import adminServices from '../../services/admin/adminServices.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';

const pageNotFound = async (req, res) => {
  try {
    res.render('adminPage404');
  } catch (error) {
    logger.error('Error rendering 404 page: ', error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(`Error loading ${statusCode.BAD_REQUEST} page`);
  }
};

const adminProfilePage = async (req, res) => {
  try {
    return res.render('adminDetails');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const adminProfile = async (req, res) => {
  try {
    console.log(req.body);
    const { firstName, lastName, email, phoneNo, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await adminServices.profile(
      firstName,
      lastName,
      email,
      phoneNo,
      hashedPassword,
    );
    return res.redirect('/admin/profile');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const loadLogin = async (req, res) => {
  try {
    return res.render('adminlogin');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (!email || !password) {
      req.flash('error_msg', messages.EMAIL_PASSWORD_ERROR);
      return res.redirect('/admin/login');
    }

    if (!email) {
      req.flash('error_msg', messages.EMAIL_ERROR);
      return res.redirect('/admin/login');
    }

    if (!password) {
      req.flash('error_msg', messages.PASSWORD_ERROR);
      return res.redirect('/admin/login');
    }

    ////////*/FORM VALIDATION/*////////

    const admin = await adminServices.findByEmail(email);

    const isMatch = await adminServices.passwordMatch(password, admin.password);
    //console.log(isMatch);
    if (!isMatch) {
      req.flash('error_msg', messages.INCORRECT_PASSWORD);
      return res.redirect('/admin/login');
    }

    req.session.admin = admin;
    //console.log(req.session.admin._id);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const loadDashboard = async (req, res) => {
  try {
    return res.render('adminDashboard');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        logger.error('error in destroying session');
        return res.redirect('/admin/dashboard');
      }
    });
    return res.redirect('/admin/login');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  pageNotFound,
  adminProfilePage,
  adminProfile,
  loadLogin,
  login,
  logout,
};
