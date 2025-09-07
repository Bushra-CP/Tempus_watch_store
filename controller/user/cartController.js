const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const cartServices = require('../../services/user/cartServices');
const session = require('express-session');
const mongoose = require('mongoose');

const cartPage = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      const userId = user._id;
      //console.log(userId);
      const cartItems = await cartServices.listCartItems(
        new mongoose.Types.ObjectId(userId),
      );
      //console.log(cartItems);
      return res.render('cart', { cartItems });
    }
    return res.render('notLoginedCart');
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
      let { productId, variantId, price, quantity } = req.body;
      productId = new mongoose.Types.ObjectId(productId);
      variantId = new mongoose.Types.ObjectId(variantId);
      // console.log('product id:', productId);
      // console.log('variant id:', variantId);
      // console.log('quantity:', quantity);
      //console.log('Type of productId:', typeof productId);

      if (quantity > 3) {
        return res.json({
          success: false,
          message: 'Order limit is 3 per user..!',
        });
      } else {
        const { product, variant } = await cartServices.productDetails(
          productId,
          variantId,
        );
        let variantImages = [];

        const productName = product.productName;
        const brand = product.brand;
        const strapMaterial = variant.strapMaterial;
        const strapColor = variant.strapColor;
        const dialColor = variant.dialColor;
        const caseSize = variant.caseSize;
        const movementType = variant.movementType;
        const caseMaterial = variant.caseMaterial;

        for (let i = 0; i < variant.variantImages.length; i++) {
          variantImages.push(variant.variantImages[i]);
        }

        let variantDetails = {
          strapMaterial,
          strapColor,
          dialColor,
          caseSize,
          movementType,
          caseMaterial,
          variantImages,
        };
        const user = req.session.user;

        let userId = user._id;
        //console.log('userId:',userId);
        userId = new mongoose.Types.ObjectId(userId);

        let cartItem = {
          productId,
          variantId,
          productName,
          brand,
          variantDetails,
          quantity,
          price,
          total: price * quantity,
        };

        const findUser = await cartServices.findUserInCart(userId);

        if (findUser) {
          const productVariant = await cartServices.findVariantInCart(
            userId,
            variantId,
          );
          if (productVariant) {
            const cartQuantity = await cartServices.checkQuantityInCart(
              userId,
              variantId,
            );
            if (cartQuantity.items[0].quantity >= 3) {
              return res.json({
                success: false,
                message:
                  'You can only order up to 3 quantities of this item..!',
              });
            } else {
              await cartServices.updateQuantity(
                userId,
                productId,
                variantId,
                quantity,
              );
            }
          } else {
            await cartServices.addMoreToCart(
              userId,
              productId,
              variantId,
              quantity,
              cartItem,
            );
          }
        } else {
          await cartServices.addToCart(
            userId,
            productId,
            variantId,
            quantity,
            cartItem,
          );
        }

        res.json({ success: true, message: 'Item added to cart' });
      }
    }
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'server error' });
  }
};

const increaseQuantity = async (req, res) => {
  try {
    let { userId, productId, variantId } = req.query;

    userId = new mongoose.Types.ObjectId(userId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);

    const cartQuantity = await cartServices.checkQuantityInCart(
      userId,
      variantId,
    );
    if (cartQuantity.items[0].quantity >= 3) {
      req.flash(
        'error_msg',
        'You can only order up to 3 quantities of this item..!',
      );
      return res.redirect('/cart');
    } else {
      const quantity = 1;
      await cartServices.updateQuantity(userId, productId, variantId, quantity);
      return res.redirect('/cart');
    }
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    let { userId, productId, variantId } = req.query;
    userId = new mongoose.Types.ObjectId(userId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);

    const quantity = -1;
    await cartServices.updateQuantity(userId, productId, variantId, quantity);
    return res.redirect('/cart');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeFromCart = async (req, res) => {
  try {
    //console.log(req.body);
    let { userId, productId, variantId, quantity } = req.body;

    userId = new mongoose.Types.ObjectId(userId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);

    await cartServices.removeVariantFromCart(
      userId,
      productId,
      variantId,
      quantity,
    );
    res.json({
      success: true,
      redirect: '/cart',
      message: 'Product removed from cart',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = {
  cartPage,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
};
