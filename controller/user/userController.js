const logger = require("../../utils/logger");
const User = require("../../models/user/userSchema");
const userServices = require("../../services/userServices");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();

const pageNotFound = async (req, res) => {
  try {
    res.render("page404");
  } catch (error) {
    logger.error("Error rendering 404 page: ", error);
    res.status(500).send("Error loading 404 page");
  }
};

const loadHomePage = async (req, res) => {
  try {
    return res.render("home");
  } catch (error) {
    logger.error("Home page not found");
    res.status(500).send("server error");
  }
};

const userSignup = async (req, res) => {
  try {
    return res.render("userSignup");
  } catch (error) {
    logger.error("Signup page not found");
    res.status(500).send("server error");
  }
};

const otpVerification=async (req, res) => {
  try {
    return res.render("verifyOtp");
  } catch (error) {
    logger.error("page not found");
    res.status(500).send("server error");
  }
};

const registerUser = async (req, res) => {
  try {
    console.log("Incoming form data:", req.body);

    const { firstName, lastName, email, phoneNo, password } = req.body;

    // Check if user already exists
    const existingUser = await userServices.findUserByEmail(email);
    if (existingUser) {
      return res.redirect("/signup?message=User already exists!");
    }

    const otp = userServices.generateOtp();

    const emailSent = await userServices.sendVerificationEmail(email, otp);

    // Encrypt password
    //const hashedPassword = await bcrypt.hash(password, 10);

    if(!emailSent){
      return res.json('email-error');
    }

    req.session.userOtp=otp;
    req.session.userData={email,password};

    //res.render('verifyOtp');
    console.log(`OTP sent:${otp}`);

    // // Create and save new user
    // await userServices.createUser(
    //   firstName,
    //   lastName,
    //   email,
    //   phoneNo,
    //   hashedPassword
    // );

    // // Success
    // return res.redirect("/login?success=Registered successfully! Login now");
  } catch (error) {
    console.log("Registration Error:", error);
    res.redirect("/signup?message=Something went wrong!");
  }
};

const userLogin = async (req, res) => {
  try {
    return res.render("userLogin");
  } catch (error) {
    logger.error("Login page not found");
    res.status(500).send("server error");
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
  userSignup,
  registerUser,
  userLogin,
  otpVerification
};
