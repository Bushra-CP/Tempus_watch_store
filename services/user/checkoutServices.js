const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const Cart = require('../../models/cartSchema');
const Order = require('../../models/orderSchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose=require('mongoose');

const listCheckoutItems = async (userId) => {
  let cartItems = await Cart.findOne({ userId });

  cartItems.items = cartItems.items.filter((x) => x.quantity > 0);

  return cartItems;
};

const getAddress = async (userId, addressId) => {
  return await Address.findOne(
    { userId, 'addresses._id': addressId },
    { _id: 0, 'addresses.$': 1 },
  );
};

const addCheckoutDetails = async (userId, orderDetails) => {
  await Cart.deleteOne({ userId });
  const newCheckout = new Order({
    userId: userId,
    orderDetails: orderDetails,
  });

  return await newCheckout.save();
};

const reduceProductsQuantity = async ({productId, variantId, quantity}) => {
  return await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $inc: { 'variants.$.stockQuantity': -quantity } },
  );
};

const findUserInOrder = async (userId) => {
  return await Order.findOne({ userId });
};

const addMoreToOrder = async (userId, orderDetails) => {
  await Cart.deleteOne({ userId });
  const user = await Order.findOne({ userId });
  const updatedOrderItems = [...user.orderDetails, orderDetails];
  return await Order.updateOne(
    { userId },
    {
      $set: {
        orderDetails: updatedOrderItems,
      },
    },
  );
};

module.exports = {
  listCheckoutItems,
  getAddress,
  addCheckoutDetails,
  reduceProductsQuantity,
  findUserInOrder,
  addMoreToOrder,
};
