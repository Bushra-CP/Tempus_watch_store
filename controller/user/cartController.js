const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const cartServices = require('../../services/user/cartServices');
const session = require('express-session');
const mongoose = require('mongoose');

const cartPage = async (req, res) => {
  try {
    return res.render('cart');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const addToCart = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      res.status(401).json({
        success: false,
        redirect: '/login',
        message: 'Please login first to add product to cart!',
      });
    } else {
      const { productId, variantId, quantity } = req.body;
      // console.log('product id:', productId);
      // console.log('variant id:', variantId);
      // console.log('quantity:', quantity);

      const { product, variant } = await cartServices.productDetails(
        productId,
        variantId,
      );
      let variantImages = [];

      const strapMaterial = variant.strapMaterial;
      const strapColor = variant.strapColor;
      const dialColor = variant.dialColor;
      const caseSize = variant.caseSize;
      const movementType = variant.movementType;
      const caseMaterial = variant.caseMaterial;

      for (let i = 0; i < variant.variantImages.length; i++) {
        variantImages.push(i);
      }

      res.json({ success: true, message: 'Item added to cart' });
    }
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'server error' });
  }
};

module.exports = { cartPage, addToCart };
