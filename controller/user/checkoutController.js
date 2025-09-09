const logger = require('../../utils/logger');
const userAddressServices = require('../../services/user/userAddressServices');
const userProfileServices = require('../../services/user/userProfileServices');
const checkoutServices = require('../../services/user/checkoutServices');
const session = require('express-session');
const mongoose = require('mongoose');

const checkoutPage = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    req.session.url = '/checkout';
    userId = new mongoose.Types.ObjectId(userId);

    let userAddresses = await userProfileServices.getUserAddresses(userId);

    let defaultAddressId = userAddresses.addresses
      .filter((x) => x.isDefault === true)
      .map((y) => y._id.toString());
    // console.log('default:', defaultAddressId[0]);
    req.session.addressId = defaultAddressId[0];
    let checkoutItems = await checkoutServices.listCheckoutItems(userId);

    let subTotal = checkoutItems.items.reduce(
      (acc, curr) => acc + curr.total,
      0,
    );
    let shippingCharge = 20;
    let discount = 0;

    let orderTotal = subTotal + shippingCharge + discount;

    req.session.subTotal = subTotal;
    req.session.orderTotal = orderTotal;

    //console.log('checkoutItems:', checkoutItems);

    res.render('checkout', {
      userAddresses,
      checkoutItems,
      subTotal,
      orderTotal,
    });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeAddress = async (req, res) => {
  try {
    let { addressId } = req.body;

    let user = req.session.user;
    let userId = user._id;
    // console.log('userId:', userId);
    // console.log('addressId:', addressId);
    addressId = new mongoose.Types.ObjectId(addressId);
    userId = new mongoose.Types.ObjectId(userId);

    await userAddressServices.removeAddress(userId, addressId);

    res.json({
      success: true,
      redirect: '/checkout',
      message: 'Address Removed',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const getCheckoutAddress = async (req, res) => {
  try {
    let addressId = req.query.id;
    req.session.addressId = addressId;
    console.log('newly selected addressId:', req.session.addressId);
    req.session.save(() => {
      // ensure session is saved
      res.json({ success: true, message: 'Address updated', addressId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const checkout = async (req, res) => {
  try {
    let addressId = req.session.addressId;
    let subTotal=req.session.subTotal;
    let orderTotal=req.session.orderTotal;

    // console.log('default:', addressId);
    // console.log(subTotal);
    // console.log(orderTotal);

    

    res.json({
      success: true,
      redirect: '/checkout',
      message: 'checkout is ok',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { checkoutPage, removeAddress, checkout, getCheckoutAddress };
