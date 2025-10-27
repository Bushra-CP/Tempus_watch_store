import User from '../../models/userSchema.js';
import Products from '../../models/productSchema.js';
import Category from '../../models/categorySchema.js';
import Wishlist from '../../models/wishlistSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const fetchWishlist = async (userId) => {
  return await Wishlist.find({ userId: userId }).sort({
    'items.createdAt': -1,
  });
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

export default {
  fetchWishlist,
  productDetails,
  findUserInWishlist,
  findProductInWishlist,
  addMoreToWishlist,
  addToWishlist,
  removeFromWishllist,
};
