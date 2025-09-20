const logger = require('../../utils/logger');
const userAddressServices = require('../../services/user/userAddressServices');
const userProfileServices = require('../../services/user/userProfileServices');
const cartServices = require('../../services/user/cartServices');
const checkoutServices = require('../../services/user/checkoutServices');
const orderServices = require('../../services/user/orderServices');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');

const checkoutPage = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    req.session.url = '/checkout';
    userId = new mongoose.Types.ObjectId(userId);

    let userAddresses = await userProfileServices.getUserAddresses(userId);

    if (userAddresses) {
      let defaultAddressId = userAddresses.addresses
        .filter((x) => x.isDefault === true)
        .map((y) => y._id.toString());
      // console.log('default:', defaultAddressId[0]);
      req.session.addressId = defaultAddressId[0];
    }
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
    let subTotal = req.session.subTotal;
    let orderTotal = req.session.orderTotal;
    let user = req.session.user;
    let userId = user._id;
    if (!addressId) {
      return res.json({
        success: false,
        redirect: '/checkout',
        message: 'Please add delivery address ..!',
      });
    }
    addressId = new mongoose.Types.ObjectId(addressId);
    userId = new mongoose.Types.ObjectId(userId);
    // console.log('default:', addressId);
    // console.log('userId',userId);
    // console.log(orderTotal);

    const address = await checkoutServices.getAddress(userId, addressId);
    //console.log('Address:',address.addresses[0].country);

    const orderNum = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortUUID = crypto.randomUUID().split('-')[0];
      return `TEMPUS-${date}-${shortUUID}`;
    };

    const orderNumber = orderNum();
    req.session.orderNumber = orderNumber;

    let shippingAddress = {
      country: address.addresses[0].country,
      name: address.addresses[0].name,
      phoneNo: address.addresses[0].phoneNo,
      addressLine: address.addresses[0].addressLine,
      landmark: address.addresses[0].landmark,
      townCity: address.addresses[0].townCity,
      state: address.addresses[0].state,
      pincode: address.addresses[0].pincode,
      addressType: address.addresses[0].addressType,
    };

    let paymentMethod = 'COD';

    let checkoutItems = await checkoutServices.listCheckoutItems(userId);
    let orderItems = [];

    for (const item of checkoutItems.items) {
      let details = {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        variantDetails: {
          strapMaterial: item.variantDetails.strapMaterial,
          strapColor: item.variantDetails.strapColor,
          dialColor: item.variantDetails.dialColor,
          caseSize: item.variantDetails.caseSize,
          movementType: item.variantDetails.movementType,
          caseMaterial: item.variantDetails.caseMaterial,
          variantImages: item.variantDetails.variantImages,
        },
      };
      const productId = details.productId;
      const variantId = details.variantId;
      const productStockQuantity = await cartServices.checkProductStockQuantity(
        productId,
        variantId,
      );
      let stockQuantity = productStockQuantity.variants[0].stockQuantity;
      console.log(stockQuantity);
      const cartQuantity = await cartServices.checkQuantityInCart(
        userId,
        variantId,
      );

      if (cartQuantity.items[0].quantity > stockQuantity) {
        console.log(cartQuantity);

        return res.json({
          success: false,
          redirect: '/cart',
          message: `There are only ${stockQuantity} pieces left for ${cartQuantity.items[0].productName} ..!`,
        });
      } else {
        await checkoutServices.reduceProductsQuantity({
          productId: details.productId,
          variantId: details.variantId,
          quantity: details.quantity,
        });

        orderItems.push(details);
      }
    }

    let orderDetails = {
      orderNumber,
      shippingAddress,
      paymentMethod,
      orderItems,
      subTotal,
      orderTotal,
    };

    const isUser = await checkoutServices.findUserInOrder(userId);
    if (isUser) {
      await checkoutServices.addMoreToOrder(userId, orderDetails);
    } else {
      await checkoutServices.addCheckoutDetails(userId, orderDetails);
    }

    res.json({
      success: true,
      redirect: '/orderSuccessful',
      message: 'Order Placed',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const thankPage = async (req, res) => {
  try {
    let orderNumber = req.session.orderNumber;
    let order = await orderServices.getByOrderNumber(orderNumber);
    //console.log(order);
    res.render('thankYou', { order });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

module.exports = {
  checkoutPage,
  removeAddress,
  checkout,
  getCheckoutAddress,
  thankPage,
};
