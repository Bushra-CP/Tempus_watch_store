const logger = require('../../utils/logger');
const orderServices = require('../../services/admin/orderServices');
const mongoose = require('mongoose');
const messages = require('../../config/messages');
const statusCode = require('../../config/statusCodes');

const orderManagementPage = async (req, res) => {
  try {
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sort = req.query.sort || 'date_desc';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const { orders, total } = await orderServices.getOrders(
      search,
      status,
      sort,
      page,
      limit,
    );

    const totalPages = Math.ceil(total / limit);

    res.render('orderManagement', {
      orders,
      search,
      status,
      sort,
      page,
      totalPages,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    console.log(req.body);
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      req.flash('error_msg', messages.ORDER_STATUS_ERROR);
      return res.redirect('/admin/orders');
    }

    await orderServices.updateOrderStatus(orderId, status);

    req.flash('success_msg', messages.ORDER_STATUS_CHANGE);

    res.redirect('/admin/orders');
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.redirect('/admin/pageNotFound');
  }
};

const approveRejectOrderRequest = async (req, res) => {
  try {
    console.log(req.body);
    let { orderId, refundAmount, action } = req.body;
    orderId = new mongoose.Types.ObjectId(orderId);
    let message = await orderServices.handleOrderRequest(
      orderId,
      action,
      refundAmount,
    );

    req.flash('success_msg', message);
    res.redirect('/admin/orders');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const approveRejectProductRequest = async (req, res) => {
  try {
    let { orderId, productId, variantId, refundAmount, notes, action } =
      req.body;

    // Convert to ObjectId where necessary
    orderId = new mongoose.Types.ObjectId(orderId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);

    // Call service
    const { order, message } = await orderServices.handleProductRequest(
      orderId,
      productId,
      variantId,
      notes,
      action,
      Number(refundAmount),
    );

    // Optionally: set flash message to show in admin panel
    req.flash('success_msg', message);

    // Redirect back to orders page
    return res.redirect('/admin/orders');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  orderManagementPage,
  updateOrderStatus,
  approveRejectOrderRequest,
  approveRejectProductRequest,
};
