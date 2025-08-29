const express = require('express');
const router = express.Router();
const userController = require('../controller/user/userController');
const otpPasswordController=require('../controller/user/otpPasswordController');
const productListingController=require('../controller/user/productListingController');
const userAuthentication=require('../middlewares/auth');
const passport = require('../config/passport');

router.get('/pageNotFound', userController.pageNotFound);

router.get('/', userController.loadHomePage);

router.get('/signup', userController.userSignup);

router.post('/signup', userController.registerUser);

router.get('/verifyOtp', otpPasswordController.verifyOtpPage);

router.post('/verifyOtp', otpPasswordController.verifyOtpFunction);

router.post('/resendOtp', otpPasswordController.resendOtp);

// Google Login start
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect after successful login
    res.redirect('/dashboard');
  }
);

router.get('/login', userController.userLogin);

router.post('/login', userController.login);

router.get('/forgotPassword', otpPasswordController.forgotPassword);

router.post('/forgotPasswordOtp', otpPasswordController.forgotPasswordOtp);

router.get('/changeForgotPswdPage', otpPasswordController.changeForgotPasswordPage);

router.post('/changeForgotPswdPage', otpPasswordController.changeForgotPassword);

router.get('/dashboard',userAuthentication.userAuth, userController.userDashboard);

router.get('/logout',userAuthentication.userAuth, userController.logout);

router.get('/collections',productListingController.productListing);

module.exports = router;
