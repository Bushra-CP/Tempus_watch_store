import User from '../../models/userSchema.js';
import Products from '../../models/productSchema.js';
import Category from '../../models/categorySchema.js';
import Cart from '../../models/cartSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

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

const isProductExists = async (productId, variantId) => {
  return await Products.findOne(
    { _id: productId, 'variants._id': variantId },
    {
      _id: 0,
      isListed: 1,
      productName: 1,
      variants: { $elemMatch: { _id: variantId } },
    },
  );
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

export default {
  productDetails,
  findUserInCart,
  isProductExists,
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
