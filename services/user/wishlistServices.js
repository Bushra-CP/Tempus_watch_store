const User = require('../../models/userSchema');
const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const Wishlist = require('../../models/wishlistSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const fetchWishlist = async (userId) => {
  return await Wishlist.find({ userId: userId }).sort({ 'items.createdAt': -1 });
};

const productDetails = async (productId) => {
  return await Products.findById({ _id: productId });
};

const findUserInWishlist = async (userId) => {
  return await Wishlist.findOne({ userId });
};

const findProductInWishlist = async (userId, productId) => {
  return await Wishlist.findOne({
    userId: userId,
    'items.productId': productId,
  });
};

const addMoreToWishlist = async (userId, wishlistItem) => {
  const user = await Wishlist.findOne({ userId });
  const updatedWishlistItems = [...user.items, wishlistItem];
  return await Wishlist.updateOne(
    { userId },
    {
      $set: {
        items: updatedWishlistItems,
      },
    },
  );
};

const addToWishlist = async (userId, wishlistItem) => {
  const newItem = new Wishlist({ userId, items: wishlistItem });
  return await newItem.save();
};

const removeFromWishllist = async (userId, productId) => {
  return await Wishlist.updateOne(
    { userId: userId },
    { $pull: { items: { productId: productId } } },
  );
};

module.exports = {
  fetchWishlist,
  productDetails,
  findUserInWishlist,
  findProductInWishlist,
  addMoreToWishlist,
  addToWishlist,
  removeFromWishllist,
};
