const express=require('express');
const router=express.Router();
const userController=require('../controller/user/userController');

router.get('/pageNotFound',userController.pageNotFound)
router.get('/',userController.loadHomePage);

router.get('/signup',userController.userSignup);
router.post('/signup',userController.registerUser);

router.get('/verifyOtp',userController.otpVerification);

router.get('/login',userController.userLogin);



module.exports=router;