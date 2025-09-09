const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const Cart = require('../../models/cartSchema');
const logger = require('../../utils/logger');

const listCheckoutItems = async (userId) => {
  let cartItems = await Cart.findOne({ userId });

  cartItems.items = cartItems.items.filter((x) => x.quantity > 0);

  return cartItems;
};

module.exports = { listCheckoutItems };
