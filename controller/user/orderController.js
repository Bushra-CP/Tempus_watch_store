const logger = require('../../utils/logger');
const checkoutServices = require('../../services/user/checkoutServices');
const orderServices = require('../../services/user/orderServices');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');

const ordersPage = async (req, res) => {
  try {
    let user=req.session.user;
    let userId=user._id;
    userId=new mongoose.Types.ObjectId(userId);
    
    res.render('orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

module.exports = { ordersPage };
