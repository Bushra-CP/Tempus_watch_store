const logger = require('../../utils/logger');
const userAddressServices = require('../../services/user/userAddressServices');
const session = require('express-session');
const mongoose = require('mongoose');
const { checkoutPage } = require('./checkoutController');

const addNewAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = req.session.user;

    const {
      country,
      name,
      phoneNo,
      pincode,
      addressLine,
      landmark,
      townCity,
      state,
      addressType,
      isDefault,
    } = req.body;

    const newAddressData = {
      country,
      name,
      phoneNo,
      pincode,
      addressLine,
      landmark,
      townCity,
      state,
      addressType,
    };

    const userExists = await userAddressServices.findUser(
      new mongoose.Types.ObjectId(userId),
    );
    if (userExists) {
      if (isDefault === 'on') {
        await userAddressServices.makeCurrentUndefault(userId);
        newAddressData.isDefault = true;
      } else {
        newAddressData.isDefault = false;
      }

      await userAddressServices.addAddressToExistingUser(
        new mongoose.Types.ObjectId(userId),
        newAddressData,
      );

      req.flash('success_msg', 'New Address Created!');
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    } else {
      if (isDefault === 'on') {
        newAddressData.isDefault = true;
      } else {
        newAddressData.isDefault = false;
      }

      await userAddressServices.addNewAddress(
        new mongoose.Types.ObjectId(userId),
        newAddressData,
      );
      req.flash('success_msg', 'New Address Created!');
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const editAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = req.session.user;

    const addressId = req.params.id;

    const {
      country,
      name,
      phoneNo,
      pincode,
      addressLine,
      landmark,
      townCity,
      state,
      addressType,
      isDefault,
    } = req.body;

    const editAddressData = {
      country,
      name,
      phoneNo,
      pincode,
      addressLine,
      landmark,
      townCity,
      state,
      addressType,
    };

    if (isDefault == 'on') {
      await userAddressServices.makeCurrentUndefault(
        new mongoose.Types.ObjectId(userId),
      );
      editAddressData.isDefault = true;
    } else {
      editAddressData.isDefault = false;
    }

    await userAddressServices.editAddress(
      new mongoose.Types.ObjectId(userId),
      addressId,
      editAddressData,
    );

    req.flash('success_msg', 'Address Edited!');
    if (req.session.url == '/checkout') {
      return res.redirect('/checkout');
    }
    return res.redirect('/dashboard');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = req.session.user;

    const addressId = req.params.id;

    await userAddressServices.removeAddress(
      new mongoose.Types.ObjectId(userId),
      addressId,
    );
    req.flash('error_msg', 'Address Deleted!');
    return res.redirect('/dashboard');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

module.exports = { addNewAddress, editAddress, removeAddress };
