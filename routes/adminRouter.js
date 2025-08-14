const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/adminController");
const customerController = require("../controller/admin/customerController");
const adminAuthentication=require('../middlewares/auth');

router.get("/login", adminController.loadLogin);

router.post("/login", adminController.login);

router.get("/dashboard",adminAuthentication.adminAuth, adminController.loadDashboard);

router.get('/logout',adminController.logout);

router.get('/users',adminAuthentication.adminAuth,customerController.loadUsers);

router.get('/blockCustomer',adminAuthentication.adminAuth,customerController.blockCustomer);

router.get('/unblockCustomer',adminAuthentication.adminAuth,customerController.unblockCustomer);

module.exports = router;
