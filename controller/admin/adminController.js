const logger = require("../../utils/logger");
const User = require("../../models/user/userSchema");
const adminServices = require("../../services/adminServices");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const session = require("express-session");
const { name } = require("ejs");
const env = require("dotenv").config();

const loadLogin = async (req, res) => {
  try {
    return res.render("adminLogin");
  } catch (error) {
    logger.error("page not found");
    res.status(500).send("Page not found");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminServices.findByEmail(email);
    
    if (!admin) {
      return res.redirect("/admin/login?message=Admin not found!");
    }

    

    if (!admin.isAdmin) {
      return res.redirect("/admin/login?message=Not authorized as admin!");
    }

    const isMatch = await adminServices.passwordMatch(password, admin.password);

    if (!isMatch) {
      return res.redirect("/admin/login?message=Incorrect password!");
    }

    req.session.admin = admin;
    //console.log(req.session.admin._id);
    return res.redirect("/admin/dashboard");
  } catch (error) {
    logger.error("page not found");
    res.status(500).send("Page not found");
  }
};

const loadDashboard = async (req, res) => {
  try {
    return res.render("adminDashboard");
  } catch (error) {
    logger.error("page not found");
    res.status(500).send("Page not found");
  }
};

const logout=async (req,res) => {
  try {
    req.session.destroy((err)=>{
      if(err){
        logger.error('error in destroying session');
        return res.redirect('/admin/dashboard');
      }
    })
    return res.redirect('/admin/login');
  } catch (error) {
    logger.error("page not found");
    res.status(500).send("Page not found");
  }
}



module.exports = {
  loadLogin,
  login,
  loadDashboard,
  logout,
};
