const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/adminController');
const customerController = require('../controller/admin/customerController');
const categoryController=require('../controller/admin/categoryController');
const adminAuthentication=require('../middlewares/auth');
const multer = require('multer');
const upload = require('../middlewares/multer');

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

module.exports = router;
