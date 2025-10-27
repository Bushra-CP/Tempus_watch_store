import express from 'express';
const router = express.Router();

import userController from '../controller/user/userController.js';
import otpPasswordController from '../controller/user/otpPasswordController.js';
import productListingController from '../controller/user/productListingController.js';
import productDetailsController from '../controller/user/productDetailsController.js';
import userProfileController from '../controller/user/userProfileController.js';
import userAddressController from '../controller/user/userAddressController.js';
import emailVerificationController from '../controller/user/emailVerificationController.js';
import cartController from '../controller/user/cartController.js';
import checkoutController from '../controller/user/checkoutController.js';
import orderController from '../controller/user/orderController.js';
import wishlistController from '../controller/user/wishlistController.js';
import couponController from '../controller/user/couponController.js';
import pageNotFound from '../middlewares/pageNotFound.js';

import userAuthentication from '../middlewares/auth.js';
import passport from '../config/passport.js';
import multer from 'multer';
import upload from '../middlewares/multer.js';
import methodOverride from 'method-override';

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
router.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureFlash: true,
  })(req, res, next);
});

// Google Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
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
  checkoutController.createRazorpayOrder,
);

router.post(
  '/checkout/verify-payment',
  userAuthentication.userAuth,
  checkoutController.checkout,
);

router.get(
  '/orderSuccessful',
  userAuthentication.userAuth,
  checkoutController.thankPage,
);

router.get(
  '/orderFailed',
  userAuthentication.userAuth,
  checkoutController.failurePage,
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

router.get(
  '/wishlist',
  userAuthentication.userAuth,
  wishlistController.wishlistPage,
);

router.get(
  '/wishlist/add',
  userAuthentication.userAuth,
  wishlistController.addToWishlist,
);

router.delete(
  '/wishlist/remove',
  userAuthentication.userAuth,
  wishlistController.removeFromWishllist,
);

router.get(
  '/wishlist/remove2',
  userAuthentication.userAuth,
  wishlistController.removeFromWishllist2,
);

router.post('/wishlist/add2', wishlistController.addToWishlist_productDetails);

router.post(
  '/cart/applyCoupon',
  userAuthentication.userAuth,
  couponController.applyCoupon,
);

router.delete(
  '/cart/removeCoupon',
  userAuthentication.userAuth,
  couponController.removeCoupon,
);

router.post(
  '/cart/applyOtherCoupon',
  userAuthentication.userAuth,
  couponController.applyOtherCoupons,
);

router.delete(
  '/cart/removeOtherCoupon',
  userAuthentication.userAuth,
  couponController.removeOtherCoupons,
);

////pageNotFound for any invalid routes////
router.use(pageNotFound.userPageNotFound);

export default router;
