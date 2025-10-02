const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/adminController');
const customerController = require('../controller/admin/customerController');
const categoryController = require('../controller/admin/categoryController');
const productController = require('../controller/admin/productController');
const orderController = require('../controller/admin/orderController');
const stockController = require('../controller/admin/stockController');
const categoryOfferController = require('../controller/admin/categoryOfferController');
const productOfferController = require('../controller/admin/productOfferController');
const couponController = require('../controller/admin/couponController');
const salesController = require('../controller/admin/salesController');
const adminAuthentication = require('../middlewares/auth');
const multer = require('multer');
const upload = require('../middlewares/multer');
const methodOverride = require('method-override');

router.get(
  '/pageNotFound',
  adminAuthentication.adminAuth,
  adminController.pageNotFound,
);

router.get('/profile', adminController.adminProfilePage);

router.post('/profile', adminController.adminProfile);

router.get('/login', adminController.loadLogin);

router.post('/login', adminController.login);

router.get(
  '/dashboard',
  adminAuthentication.adminAuth,
  adminController.loadDashboard,
);

router.get('/logout', adminController.logout);

router.get(
  '/users',
  adminAuthentication.adminAuth,
  customerController.loadUsers,
);

router.get(
  '/user/block',
  adminAuthentication.adminAuth,
  customerController.blockCustomer,
);

router.get(
  '/user/unblock',
  adminAuthentication.adminAuth,
  customerController.unblockCustomer,
);

router.get(
  '/category',
  adminAuthentication.adminAuth,
  categoryController.categories,
);

router.get(
  '/category/add',
  adminAuthentication.adminAuth,
  categoryController.addCategoryPage,
);

router.post(
  '/category/add',
  upload.single('image'),
  categoryController.addCategory,
);

router.get(
  '/category/deactivate',
  adminAuthentication.adminAuth,
  categoryController.deactivateCategory,
);

router.get(
  '/category/activate',
  adminAuthentication.adminAuth,
  categoryController.activateCategory,
);

router.get(
  '/category/edit',
  adminAuthentication.adminAuth,
  categoryController.editCategoryPage,
);

router.post(
  '/category/edit/:id',
  upload.single('image'),
  categoryController.categoryEdit,
);

router.get(
  '/products',
  adminAuthentication.adminAuth,
  productController.products,
);

router.get(
  '/products/add',
  adminAuthentication.adminAuth,
  productController.addProductsPage,
);

router.post(
  '/products/add',
  adminAuthentication.adminAuth,
  upload.any(),
  productController.addProducts,
);

router.patch(
  '/products/variant/unlist',
  adminAuthentication.adminAuth,
  productController.unlistVariant,
);

router.patch(
  '/products/variant/list',
  adminAuthentication.adminAuth,
  productController.listVariant,
);

router.get(
  '/products/variant/edit',
  adminAuthentication.adminAuth,
  productController.variantEditPage,
);

router.post(
  '/products/variant/edit',
  upload.any(),
  productController.variantEdit,
);

router.get(
  '/products/unlist',
  adminAuthentication.adminAuth,
  productController.unlistProduct,
);

router.get(
  '/products/list',
  adminAuthentication.adminAuth,
  productController.listProduct,
);

router.get(
  '/products/variant/add',
  adminAuthentication.adminAuth,
  productController.addVariantsPage,
);

router.post(
  '/products/variant/add',
  upload.any(),
  productController.variantAdd,
);

router.post(
  '/products/edit',
  adminAuthentication.adminAuth,
  productController.editProduct,
);

router.delete(
  '/products/variant/removeImage',
  adminAuthentication.adminAuth,
  productController.removeImage,
);

router.get(
  '/orders',
  adminAuthentication.adminAuth,
  orderController.orderManagementPage,
);

router.patch(
  '/updateOrderStatus',
  adminAuthentication.adminAuth,
  orderController.updateOrderStatus,
);

router.patch(
  '/orderRequest',
  adminAuthentication.adminAuth,
  orderController.approveRejectOrderRequest,
);

router.patch(
  '/productRequest',
  adminAuthentication.adminAuth,
  orderController.approveRejectProductRequest,
);

router.get(
  '/inventory',
  adminAuthentication.adminAuth,
  stockController.inventoryPage,
);

router.patch(
  '/editStock',
  adminAuthentication.adminAuth,
  stockController.editStock,
);

router.post(
  '/addCategoryOffer',
  adminAuthentication.adminAuth,
  categoryOfferController.addCategoryOffer,
);

router.put(
  '/editCategoryOffer',
  adminAuthentication.adminAuth,
  categoryOfferController.editCategoryOffer,
);

router.post(
  '/addProductOffer',
  adminAuthentication.adminAuth,
  productOfferController.addProductOffer,
);

router.put(
  '/editProductOffer',
  adminAuthentication.adminAuth,
  productOfferController.editProductOffer,
);

router.get(
  '/categoryOffers',
  adminAuthentication.adminAuth,
  categoryOfferController.categoryOfferPage,
);

router.delete(
  '/categoryOffers/removeOffer',
  adminAuthentication.adminAuth,
  categoryOfferController.removeOffer,
);

router.patch(
  '/categoryOffers/deactivateOffer',
  adminAuthentication.adminAuth,
  categoryOfferController.deactivateOffer,
);

router.patch(
  '/categoryOffers/activateOffer',
  adminAuthentication.adminAuth,
  categoryOfferController.activateOffer,
);

router.get(
  '/productOffers',
  adminAuthentication.adminAuth,
  productOfferController.productOfferPage,
);

router.delete(
  '/productOffers/removeOffer',
  adminAuthentication.adminAuth,
  productOfferController.removeOffer,
);

router.patch(
  '/productOffers/deactivateOffer',
  adminAuthentication.adminAuth,
  productOfferController.deactivateOffer,
);

router.patch(
  '/productOffers/activateOffer',
  adminAuthentication.adminAuth,
  productOfferController.activateOffer,
);

router.get(
  '/coupons',
  adminAuthentication.adminAuth,
  couponController.couponPage,
);

router.post(
  '/coupons/add',
  adminAuthentication.adminAuth,
  couponController.addNewCoupon,
);

router.put(
  '/coupons/edit',
  adminAuthentication.adminAuth,
  couponController.editCoupon,
);

router.delete(
  '/coupons/remove',
  adminAuthentication.adminAuth,
  couponController.removeCoupon,
);

router.patch(
  '/coupons/deactivate',
  adminAuthentication.adminAuth,
  couponController.deactivateCoupon,
);

router.patch(
  '/coupons/activate',
  adminAuthentication.adminAuth,
  couponController.activateCoupon,
);

router.get('/sales', adminAuthentication.adminAuth, salesController.salesPage);

module.exports = router;
