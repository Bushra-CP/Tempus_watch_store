const express = require("express");
const router = express.Router();
const userController = require("../controller/user/userController");
const passport = require("../config/passport");

router.get("/pageNotFound", userController.pageNotFound);
router.get("/", userController.loadHomePage);

router.get("/signup", userController.userSignup);
router.post("/signup", userController.registerUser);

router.get("/verifyOtp", userController.verifyOtpPage);
router.post("/verifyOtp", userController.verifyOtpFunction);

router.post("/resendOtp", userController.resendOtp);

// Google Login start
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect after successful login
    res.redirect("/dashboard");
  }
);

router.get("/login", userController.userLogin);
router.post('/login',userController.login);

router.get('/forgotPassword',userController.forgotPassword);

router.post('/forgotPasswordOtp',userController.forgotPasswordOtp);

router.get('/changeForgotPswdPage',userController.changeForgotPasswordPage);

router.post('/changeForgotPswdPage',userController.changeForgotPassword);

router.get('/dashboard',userController.userDashboard);

module.exports = router;
