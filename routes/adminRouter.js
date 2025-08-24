const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/adminController');
const customerController = require('../controller/admin/customerController');
const categoryController=require('../controller/admin/categoryController');
const productController=require('../controller/admin/productController');
const adminAuthentication=require('../middlewares/auth');
const multer = require('multer');
const upload = require('../middlewares/multer');

router.get('/pageNotFound', adminController.pageNotFound);

router.get('/login', adminController.loadLogin);

router.post('/login', adminController.login);

router.get('/dashboard',adminAuthentication.adminAuth, adminController.loadDashboard);

router.get('/logout',adminController.logout);

router.get('/users',adminAuthentication.adminAuth,customerController.loadUsers);

router.get('/user/block',adminAuthentication.adminAuth,customerController.blockCustomer);

router.get('/user/unblock',adminAuthentication.adminAuth,customerController.unblockCustomer);

router.get('/category',adminAuthentication.adminAuth,categoryController.categories);

router.get('/category/add',adminAuthentication.adminAuth,categoryController.addCategoryPage);

router.post('/category/add', upload.single('image'), categoryController.addCategory);

router.get('/category/deactivate',adminAuthentication.adminAuth,categoryController.deactivateCategory);

router.get('/category/activate',adminAuthentication.adminAuth,categoryController.activateCategory);

router.get('/category/edit',adminAuthentication.adminAuth,categoryController.editCategoryPage);

router.post('/category/edit/:id', upload.single('image'), categoryController.categoryEdit);

router.get('/products',adminAuthentication.adminAuth,productController.products);

router.get('/products/add',adminAuthentication.adminAuth,productController.addProductsPage);

router.post('/products/add',adminAuthentication.adminAuth,upload.any(),productController.addProducts);

router.patch('/products/variant/unlist',adminAuthentication.adminAuth,productController.unlistVariant);

router.patch('/products/variant/list',adminAuthentication.adminAuth,productController.listVariant);

router.get('/products/variant/edit',adminAuthentication.adminAuth,productController.variantEditPage);

router.post('/products/variant/edit',upload.any(),productController.variantEdit);

router.get('/products/unlist',adminAuthentication.adminAuth,productController.unlistProduct);

router.get('/products/list',adminAuthentication.adminAuth,productController.listProduct);

router.get('/products/variant/add',adminAuthentication.adminAuth,productController.addVariantsPage);

router.post('/products/variant/add',upload.any(),productController.variantAdd);

router.post('/products/edit',adminAuthentication.adminAuth,productController.editProduct);

router.delete('/products/variant/removeImage',adminAuthentication.adminAuth,productController.removeImage);

module.exports = router;
