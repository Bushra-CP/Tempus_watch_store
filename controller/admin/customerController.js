const logger = require("../../utils/logger");
const User = require("../../models/user/userSchema");
const adminServices = require("../../services/adminServices");
const bcrypt = require("bcrypt");
const session = require("express-session");


const loadUsers=async (req,res) => {
  try {
    let search=req.query.search || '';
    // console.log(search)
    const page=req.query.page || 1;
    const limit=5;

    const { users, totalPages } = await adminServices.getUsers(search, page, limit);

    res.render('manageUsers', { users, search, page, totalPages });
  } catch (error) {
    logger.error('page not found');
    res.status(500).send('page not found');
  }
}

const blockCustomer=async (req,res) => {
  try {
    let id=req.query.id;
    await adminServices.customerBlock(id);
    res.redirect('/admin/users?message=Blocked customer');
  } catch (error) {
    logger.error('page not found');
    res.status(500).send('page not found');
  }
}

const unblockCustomer=async (req,res) => {
  try {
    let id=req.query.id;
    await adminServices.customerUnblock(id);
    res.redirect('/admin/users?message=Unblocked customer');
  } catch (error) {
    logger.error('page not found');
    res.status(500).send('page not found');
  }
}


module.exports={
    loadUsers,
    blockCustomer,
    unblockCustomer,
}