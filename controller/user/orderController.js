const logger = require('../../utils/logger');
const checkoutServices = require('../../services/user/checkoutServices');
const orderServices = require('../../services/user/orderServices');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');

const ordersPage = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);

    let orders = await orderServices.fetchOrders(userId);

    res.render('orders', { orders });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const orderCancel = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);

    const {
      orderId,
      orderNumber,
      refundAmount,
      cancelReason,
      additionalNotes,
    } = req.body;

    let orders = await orderServices.getByOrderNumber(orderNumber);

    let cancellingProducts = orders.orderDetails[0];

    for (const item of cancellingProducts.orderItems) {
      await orderServices.increaseProductsQuantity({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    await orderServices.orderCancel(
      userId,
      orderId,
      refundAmount,
      cancelReason,
      additionalNotes,
    );

    req.flash('success_msg', 'Cancellation request submitted..!');

    return res.redirect('/orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const cancelItem=async (req,res) => {
  
};

module.exports = { ordersPage, orderCancel };
