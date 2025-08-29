const logger = require('../../utils/logger');
const adminServices = require('../../services/admin/adminServices');
const bcrypt = require('bcrypt');
const session = require('express-session');

const pageNotFound = async (req, res) => {
  try {
    res.render('adminPage404');
  } catch (error) {
    logger.error('Error rendering 404 page: ', error);
    res.status(500).send('Error loading 404 page');
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
    return res.render('adminLogin');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminServices.findByEmail(email);

    const isMatch = await adminServices.passwordMatch(password, admin.password);
    //console.log(isMatch);
    if (!isMatch) {
      req.flash('error_msg', 'Incorrect password!');
      return res.redirect('/admin/login');
    }

    req.session.admin = admin;
    //console.log(req.session.admin._id);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const loadDashboard = async (req, res) => {
  try {
    return res.render('adminDashboard');
  } catch (error) {
    logger.error('page not found', +error);
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
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  pageNotFound,
  adminProfilePage,
  adminProfile,
  loadLogin,
  login,
  loadDashboard,
  logout,
};
