import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import wishlistServices from '../../services/user/wishlistServices.js';
import session from 'express-session';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';

const wishlistPage = async (req, res) => {
  try {
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);
    let wishlistItems = await wishlistServices.fetchWishlist(userId);
    let wishlist = wishlistItems[0].items;
    //console.log(wishlist);
    res.render('wishlist', { wishlist });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const addToWishlist = async (req, res) => {
  try {
    //console.log(req.query);

    const user = req.session.user;

    if (!user) {
      req.flash('error_msg', messages.WISHLIST_NO_USER_SESSION);
      return res.redirect('/login');
    } else {
      let { productId, variantId } = req.query;

      productId = new mongoose.Types.ObjectId(productId);
      variantId = new mongoose.Types.ObjectId(variantId);

      const product = await wishlistServices.productDetails(productId);

      let variantImages = [];

      const productName = product.productName;
      const brand = product.brand;

      let prices = product.variants.map((v) => v.offerPrice).filter((p) => p);
      let minPrice = Math.min(...prices);
      let maxPrice = Math.max(...prices);

      for (let i = 0; i < product.variants[0].variantImages.length; i++) {
        variantImages.push(product.variants[0].variantImages[i]);
      }

      let userId = user._id;
      //console.log('userId:',userId);
      userId = new mongoose.Types.ObjectId(userId);

      let wishlistItem = {
        productId,
        variantId,
        productName,
        minPrice,
        maxPrice,
        variantImages,
      };

      const findUser = await wishlistServices.findUserInWishlist(userId);

      if (findUser) {
        const findProduct = await wishlistServices.findProductInWishlist(
          userId,
          productId,
        );
        if (findProduct) {
          req.flash('error_msg', messages.WISHLIST_PRODUCT_EXISTS);
          return res.redirect('/collections');
        } else {
          await wishlistServices.addMoreToWishlist(userId, wishlistItem);
          req.flash('success_msg', messages.WISHLIST_PRODUCT_ADDED);
          return res.redirect('/collections');
        }
      } else {
        await wishlistServices.addToWishlist(userId, wishlistItem);
        req.flash('success_msg', messages.WISHLIST_PRODUCT_ADDED);
        return res.redirect('/collections');
      }
    }
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeFromWishllist = async (req, res) => {
  try {
    //console.log(req.body);
    let user = req.session.user;
    let userId = user._id;
    userId = new mongoose.Types.ObjectId(userId);
    let { productId } = req.body;
    productId = new mongoose.Types.ObjectId(productId);

    await wishlistServices.removeFromWishllist(userId, productId);

    return res.json({
      success: true,
      message: 'Removed from wishlist!',
    });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const addToWishlist_productDetails = async (req, res) => {
  try {
    console.log(req.body);
    const user = req.session.user;

    if (!user) {
      return res.json({
        success: false,
        message: messages.WISHLIST_NO_USER_SESSION,
        redirect: '/login',
      });
    } else {
      let { productId, variantId } = req.body;

      productId = new mongoose.Types.ObjectId(productId);
      variantId = new mongoose.Types.ObjectId(variantId);

      const product = await wishlistServices.productDetails(productId);

      const productName = product.productName;
      const brand = product.brand;

      let prices = product.variants.map((v) => v.offerPrice).filter((p) => p);
      let minPrice = Math.min(...prices);
      let maxPrice = Math.max(...prices);

      const selectedVariant = product.variants.find((v) =>
        v._id.equals(variantId),
      );
      let variantImages = selectedVariant ? selectedVariant.variantImages : [];

      let userId = user._id;
      //console.log('userId:',userId);
      userId = new mongoose.Types.ObjectId(userId);

      let wishlistItem = {
        productId,
        variantId,
        productName,
        minPrice,
        maxPrice,
        variantImages,
      };

      const findUser = await wishlistServices.findUserInWishlist(userId);

      if (findUser) {
        const findProduct = await wishlistServices.findProductInWishlist(
          userId,
          productId,
        );
        if (findProduct) {
          return res.json({
            success: false,
            message: messages.WISHLIST_PRODUCT_EXISTS,
          });
        } else {
          await wishlistServices.addMoreToWishlist(userId, wishlistItem);
          return res.json({
            success: true,
            message: messages.WISHLIST_PRODUCT_ADDED,
          });
        }
      } else {
        await wishlistServices.addToWishlist(userId, wishlistItem);
        return res.json({
          success: true,
          message: messages.WISHLIST_PRODUCT_ADDED,
        });
      }
    }
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeFromWishllist2 = async (req, res) => {
  try {
    console.log(req.query);
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

export default {
  addToWishlist,
  wishlistPage,
  removeFromWishllist,
  addToWishlist_productDetails,
  removeFromWishllist2,
};
