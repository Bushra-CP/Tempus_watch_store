import logger from '../../utils/logger.js';
import userAddressServices from '../../services/user/userAddressServices.js';
import session from 'express-session';
import mongoose from 'mongoose';
import checkoutController from './checkoutController.js';
import messages from '../../config/messages.js';

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

    ////////*/FORM VALIDATION/*////////

    if (!country || typeof country !== 'string' || country.trim() === '') {
      req.flash('error_msg', messages.COUNTRY_NAME_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      req.flash('error_msg', messages.NAME_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
      req.flash('error_msg', messages.PHONE_NO_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      req.flash('error_msg', messages.PINCODE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (
      !addressLine ||
      typeof addressLine !== 'string' ||
      addressLine.trim() === ''
    ) {
      req.flash('error_msg', messages.ADDRESSLINE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!townCity || typeof townCity !== 'string' || townCity.trim() === '') {
      req.flash('error_msg', messages.TOWN_CITY_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!state || typeof state !== 'string' || state.trim() === '') {
      req.flash('error_msg', messages.STATE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    ////////*/FORM VALIDATION/*////////

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

    ////////*/FORM VALIDATION/*////////

    if (!country || typeof country !== 'string' || country.trim() === '') {
      req.flash('error_msg', messages.COUNTRY_NAME_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      req.flash('error_msg', messages.NAME_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
      req.flash('error_msg', messages.PHONE_NO_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      req.flash('error_msg', messages.PINCODE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (
      !addressLine ||
      typeof addressLine !== 'string' ||
      addressLine.trim() === ''
    ) {
      req.flash('error_msg', messages.ADDRESSLINE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!townCity || typeof townCity !== 'string' || townCity.trim() === '') {
      req.flash('error_msg', messages.TOWN_CITY_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    if (!state || typeof state !== 'string' || state.trim() === '') {
      req.flash('error_msg', messages.STATE_ERROR);
      if (req.session.url == '/checkout') {
        return res.redirect('/checkout');
      }
      return res.redirect('/dashboard');
    }

    ////////*/FORM VALIDATION/*////////

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
    req.flash('success_msg', 'Address Deleted!');
    return res.redirect('/dashboard');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

export default { addNewAddress, editAddress, removeAddress };
