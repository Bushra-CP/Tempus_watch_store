import logger from '../../utils/logger.js';
import checkoutServices from '../../services/user/checkoutServices.js';
import orderServices from '../../services/user/orderServices.js';
import session from 'express-session';
import mongoose from 'mongoose';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import path from 'path';

const ordersPage = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = new mongoose.Types.ObjectId(String(user._id));

    let search = req.query.search || '';

    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    let { orders, total, totalPages } = await orderServices.fetchOrders(
      userId,
      search,
      page,
      limit,
    );
    //console.log(orders[0]);
    res.render('orders', {
      orders,
      search,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/pageNotFound');
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

    const { status, message } = await orderServices.orderCancel(
      userId,
      orderId,
      refundAmount,
      cancelReason,
      additionalNotes,
    );

    req.flash(`${status}_msg`, `${message}`);

    return res.redirect('/orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const orderReturn = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);

    const {
      orderId,
      orderNumber,
      refundAmount,
      returnReason,
      additionalNotes,
    } = req.body;

    await orderServices.returnOrder(
      userId,
      orderId,
      refundAmount,
      returnReason,
      additionalNotes,
    );

    req.flash('success_msg', 'Return request submitted..!');

    return res.redirect('/orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const cancelItem = async (req, res) => {
  try {
    //console.log(req.body);
    const {
      orderId,
      orderNumber,
      productId,
      variantId,
      refundAmount,
      cancelReason,
      additionalNotes,
    } = req.body;

    const { status, message } = await orderServices.cancelItem(
      new mongoose.Types.ObjectId(orderId),
      orderNumber,
      new mongoose.Types.ObjectId(productId),
      new mongoose.Types.ObjectId(variantId),
      refundAmount,
      cancelReason,
      additionalNotes,
    );
    req.flash(`${status}_msg`, `${message}`);

    return res.redirect('/orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const returnItem = async (req, res) => {
  try {
    //console.log(req.body);
    const {
      orderId,
      orderNumber,
      productId,
      variantId,
      refundAmount,
      returnReason,
      additionalNotes,
    } = req.body;

    await orderServices.returnItem(
      new mongoose.Types.ObjectId(orderId),
      orderNumber,
      new mongoose.Types.ObjectId(productId),
      new mongoose.Types.ObjectId(variantId),
      refundAmount,
      returnReason,
      additionalNotes,
    );
    req.flash('success_msg', 'Return request submitted..!');

    return res.redirect('/orders');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber;

    // Example: fetch order from DB
    const order = await orderServices.getByOrderNumber(orderNumber);
    //console.log(order);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const orderDetails = order.orderDetails[0]; // since you store as array

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${orderDetails.orderNumber}.pdf"`,
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Order Info
    doc.fontSize(12).text(`Order Number: ${orderDetails.orderNumber}`);
    doc.text(`Order Date: ${orderDetails.orderDate.toDateString()}`);
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`);
    doc.text(`Total Amount: ₹${orderDetails.orderTotal}`);
    doc.moveDown();

    // Shipping Address
    doc.fontSize(14).text('Shipping Address:', { underline: true });
    const addr = orderDetails.shippingAddress;
    doc.fontSize(12).text(`${addr.name}`);
    doc.text(`${addr.addressLine}, ${addr.townCity}, ${addr.state}`);
    doc.text(`${addr.country} - ${addr.pincode}`);
    doc.text(`Phone: ${addr.phoneNo}`);
    doc.moveDown();

    // Products
    doc.fontSize(14).text('Products:', { underline: true });
    orderDetails.orderItems.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${item.productName} - ${item.quantity} x Rs.${item.price} - Rs.${item.discount ?? 0} (Discount Applied) = Rs.${item.finalDiscountedPrice ?? item.total}`,
        );
    });
    doc.moveDown();

    // payment summary
    doc.fontSize(14).text('Payment Summary:', { underline: true });
    doc.fontSize(12).text(`Sub Total: ${orderDetails.subTotal}`);
    doc.fontSize(12).text(`Shipping Charge: ${orderDetails.shippingCharge}`);
    doc.fontSize(12).text(`Discount: ₹${orderDetails.discount}`);
    doc.fontSize(12).text(`Order Total: ${orderDetails.orderTotal}`);
    doc.moveDown();

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating invoice');
  }
};

export default {
  ordersPage,
  orderCancel,
  orderReturn,
  cancelItem,
  returnItem,
  downloadInvoice,
};
