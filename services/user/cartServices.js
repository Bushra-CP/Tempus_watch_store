const User = require('../../models/userSchema');
const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const Cart = require('../../models/cartSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const productDetails = async (productId, variantId) => {
  const product = await Products.findById({ _id: productId }).populate(
    'category',
    'categoryName',
  );
  const variant = product.variants.id(variantId);
  return { product, variant };
};

const findUserInCart = async (userId) => {
  return await Cart.findOne({ userId });
};

const addToCart = async (userId, productId, variantId, cartItem) => {
  const newItem = new Cart({ userId, items: cartItem });
  return await newItem.save();
};

const addMoreToCart = async (userId, productId, variantId, cartItem) => {
  const user = await Cart.findOne({ userId });
  const updatedCartItems = [...user.items, cartItem];
  return await Cart.updateOne(
    { userId },
    {
      $set: {
        items: updatedCartItems,
      },
    },
  );
};

const findVariantInCart = async (userId, variantId) => {
  return await Cart.findOne({ userId, 'items.variantId': variantId });
};

const updateQuantity = async (userId, productId, variantId, quantity) => {
  const cart = await Cart.findOneAndUpdate(
    { userId, 'items.variantId': variantId },
    { $inc: { 'items.$.quantity': quantity } },
    { new: true },
  );
  // find the updated item
  const item = cart.items.find(
    (i) => i.variantId.toString() === variantId.toString(),
  );

  if (item.quantity <= 0) {
    return await Cart.updateOne(
      { userId },
      { $pull: { items: { variantId: variantId } } },
    );
  }

  // recalc total
  item.total = item.quantity * item.price;

  // save updated total
  await cart.save();
};

const listCartItems = async (userId) => {
  return await Cart.findOne({ userId });
};

const deleteUserCart = async (userId) => {
  return await Cart.deleteOne({ userId });
};

const removeVariantFromCart = async (
  userId,
  productId,
  variantId,
  quantity,
) => {
  await Cart.updateOne(
    { userId },
    { $pull: { items: { variantId: variantId } } },
  );

  const cart = await Cart.findOne({ userId });
  if (cart && cart.items.length === 0) {
    await Cart.deleteOne({ userId });
  }

  return { success: true };
};

const checkQuantityInCart = async (userId, variantId) => {
  return await Cart.findOne(
    { userId, 'items.variantId': variantId },
    { _id: 0, 'items.$': 1 },
  );
};

const checkProductStockQuantity = async (productId, variantId) => {
  return await Products.findOne(
    { _id: productId, 'variants._id': variantId },
    { _id: 0, 'variants.$': 1 },
  );
};

const setStockQuantityToZero = async (
  userId,
  productId,
  variantId,
  quantity,
) => {
  const cart = await Cart.findOneAndUpdate(
    { userId, 'items.variantId': variantId },
    { $set: { 'items.$.quantity': quantity } },
    { new: true },
  );
  // find the updated item
  const item = cart.items.find(
    (i) => i.variantId.toString() === variantId.toString(),
  );

  // recalc total
  item.total = item.quantity * item.price;

  // save updated total
  await cart.save();
};

module.exports = {
  productDetails,
  findUserInCart,
  findVariantInCart,
  addToCart,
  addMoreToCart,
  listCartItems,
  updateQuantity,
  deleteUserCart,
  removeVariantFromCart,
  checkQuantityInCart,
  checkProductStockQuantity,
  setStockQuantityToZero,
};
