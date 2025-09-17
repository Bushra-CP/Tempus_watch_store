const express = require('express');
const router = express.Router();
const userController = require('../controller/user/userController');
const otpPasswordController = require('../controller/user/otpPasswordController');
const productListingController = require('../controller/user/productListingController');
const productDetailsController = require('../controller/user/productDetailsController');
const userProfileController = require('../controller/user/userProfileController');
const userAddressController = require('../controller/user/userAddressController');
const emailVerificationController = require('../controller/user/emailVerificationController');
const cartController = require('../controller/user/cartController');
const checkoutController = require('../controller/user/checkoutController');
const orderController = require('../controller/user/orderController');
const userAuthentication = require('../middlewares/auth');
const passport = require('../config/passport');
const multer = require('multer');
const upload = require('../middlewares/multer');
const methodOverride = require('method-override');

router.get('/pageNotFound', userController.pageNotFound);

router.get('/', userController.loadHomePage);

router.get(
  '/signup',
  userAuthentication.preventUserLoginAccess,
  userController.userSignup,
);

router.post(
  '/signup',
  userAuthentication.preventUserLoginAccess,
  userController.registerUser,
);

router.get('/verifyOtp', otpPasswordController.verifyOtpPage);

router.post('/verifyOtp', otpPasswordController.verifyOtpFunction);

router.post('/resendOtp', otpPasswordController.resendOtp);

// Google Login start
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Google Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.user = {
      _id: req.user._id,
      name: req.user.firstName,
      email: req.user.email,
    };

    if (req.session.cartUrl) {
      return res.redirect(req.session.cartUrl);
    }
    if (req.session.cartAddress === '/cart') {
      return res.redirect('/cart');
    }

    return res.redirect('/');
  },
);

router.get(
  '/login',
  userAuthentication.preventUserLoginAccess,
  userController.userLogin,
);

router.post(
  '/login',
  userAuthentication.preventUserLoginAccess,
  userController.login,
);

router.get(
  '/forgotPassword',
  userAuthentication.preventUserLoginAccess,
  otpPasswordController.forgotPassword,
);

router.post(
  '/forgotPasswordOtp',
  userAuthentication.preventUserLoginAccess,
  otpPasswordController.forgotPasswordOtp,
);

router.get(
  '/changeForgotPswdPage',
  userAuthentication.preventUserLoginAccess,
  otpPasswordController.changeForgotPasswordPage,
);

router.post(
  '/changeForgotPswdPage',
  userAuthentication.preventUserLoginAccess,
  otpPasswordController.changeForgotPassword,
);

router.get(
  '/dashboard',
  userAuthentication.userAuth,
  userProfileController.userDashboard,
);

router.post(
  '/dashboard/editProfile/:id',
  upload.single('image'),
  userProfileController.editProfile,
);

router.post(
  '/dashboard/newAddress',
  userAuthentication.userAuth,
  userAddressController.addNewAddress,
);

router.put(
  '/dashboard/editAddress/:id',
  userAuthentication.userAuth,
  userAddressController.editAddress,
);

router.delete(
  '/dashboard/removeAddress/:id',
  userAuthentication.userAuth,
  userAddressController.removeAddress,
);

router.patch(
  '/dashboard/editPassword',
  userAuthentication.userAuth,
  userProfileController.changePassword,
);

router.post(
  '/sendEmailOtp',
  userAuthentication.userAuth,
  emailVerificationController.sendOtp,
);

router.get(
  '/changeEmail',
  userAuthentication.userAuth,
  emailVerificationController.changeEmailPage,
);

router.post(
  '/changeEmail',
  userAuthentication.userAuth,
  emailVerificationController.changeEmail,
);

router.get('/logout', userController.logout);

router.get('/collections', productListingController.productListing);

router.get('/collections/:id', productDetailsController.productDetails);

router.get('/cart', cartController.cartPage);

router.post('/cart/add', cartController.addToCart);

router.get(
  '/cart/increaseQty',
  userAuthentication.userAuth,
  cartController.increaseQuantity,
);

router.get(
  '/cart/decreaseQty',
  userAuthentication.userAuth,
  cartController.decreaseQuantity,
);

router.delete(
  '/cart/remove',
  userAuthentication.userAuth,
  cartController.removeFromCart,
);

router.get(
  '/checkout',
  userAuthentication.userAuth,
  checkoutController.checkoutPage,
);

router.delete(
  '/checkout/removeAddress',
  userAuthentication.userAuth,
  checkoutController.removeAddress,
);

router.get(
  '/checkout/getSelectedAddressId',
  userAuthentication.userAuth,
  checkoutController.getCheckoutAddress,
);

router.post(
  '/checkout/placeOrder',
  userAuthentication.userAuth,
  checkoutController.checkout,
);

router.get(
  '/orderSuccessful',
  userAuthentication.userAuth,
  checkoutController.thankPage,
);

router.get('/orders', userAuthentication.userAuth, orderController.ordersPage);

router.post(
  '/orders/cancelOrder',
  userAuthentication.userAuth,
  orderController.orderCancel,
);

router.post(
  '/orders/returnOrder',
  userAuthentication.userAuth,
  orderController.orderReturn,
);

router.post(
  '/orders/cancelItem',
  userAuthentication.userAuth,
  orderController.cancelItem,
);

router.post(
  '/orders/returnItem',
  userAuthentication.userAuth,
  orderController.returnItem,
);

router.get(
  '/orders/invoice',
  userAuthentication.userAuth,
  orderController.downloadInvoice,
);

module.exports = router;
