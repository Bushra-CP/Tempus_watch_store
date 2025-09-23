const logger = require('../../utils/logger');
const User = require('../../models/userSchema');
const cartServices = require('../../services/user/cartServices');
const wishlistServices = require('../../services/user/wishlistServices');
const session = require('express-session');
const mongoose = require('mongoose');

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
      let userId = user._id;
      userId = new mongoose.Types.ObjectId(userId);

      let { productId, variantId, price, quantity } = req.body;

      productId = new mongoose.Types.ObjectId(productId);
      variantId = new mongoose.Types.ObjectId(variantId);

      await wishlistServices.removeFromWishllist(userId, productId);

      const productStockQuantity = await cartServices.checkProductStockQuantity(
        productId,
        variantId,
      );
      let stockQuantity = productStockQuantity.variants[0].stockQuantity;
      if (quantity > stockQuantity) {
        return res.json({
          success: false,
          message: `There are only ${stockQuantity} pieces left for this product..!`,
        });
      }

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
            const currentQty = cartQuantity.items[0].quantity;

            // console.log(
            //   'currentQty:',
            //   currentQty,
            //   'incoming quantity:',
            //   typeof(quantity),
            // );

            if (currentQty >= stockQuantity) {
              return res.json({
                success: false,
                message: `Only ${stockQuantity} pieces left in stock.`,
              });
            }

            if (currentQty + Number(quantity) > 3) {
              return res.json({
                success: false,
                message: 'Maximum 3 units allowed per customer.',
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
              cartItem,
            );
          }
        } else {
          await cartServices.addToCart(userId, productId, variantId, cartItem);
        }

        res.json({ success: true, message: 'Item added to cart' });
      }
    }
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'server error' });
  }
};

const cartPage = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      let userId = user._id;
      userId = new mongoose.Types.ObjectId(userId);

      //console.log(userId);
      const cartItem = await cartServices.listCartItems(userId);

      //console.log(cartItems.items);
      if (cartItem) {
        for (let i = 0; i < cartItem.items.length; i++) {
          let productId = cartItem.items[i].productId;
          let variantId = cartItem.items[i].variantId;

          productId = new mongoose.Types.ObjectId(productId);
          variantId = new mongoose.Types.ObjectId(variantId);

          const productStockQuantity =
            await cartServices.checkProductStockQuantity(productId, variantId);

          let stockQuantity = productStockQuantity.variants[0].stockQuantity;

          const productVariant = await cartServices.findVariantInCart(
            userId,
            variantId,
          );

          if (stockQuantity == 0 && productVariant) {
            let quantity = 0;
            await cartServices.setStockQuantityToZero(
              userId,
              productId,
              variantId,
              quantity,
            );
          }
        }
      }
      const cartItems = await cartServices.listCartItems(userId);

      return res.render('cart', { cartItems });
    }
    return res.render('notLoginedCart');
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const increaseQuantity = async (req, res) => {
  try {
    let { userId, productId, variantId } = req.query;

    userId = new mongoose.Types.ObjectId(userId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);

    const productStockQuantity = await cartServices.checkProductStockQuantity(
      productId,
      variantId,
    );
    let stockQuantity = productStockQuantity.variants[0].stockQuantity;

    const cartQuantity = await cartServices.checkQuantityInCart(
      userId,
      variantId,
    );

    if (cartQuantity.items[0].quantity == stockQuantity) {
      req.flash(
        'error_msg',
        `There are only ${stockQuantity} pieces left for this product..!`,
      );
      return res.redirect('/cart');
    }

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

// const outOfStockProductInCart = async (req, res) => {
//   try {
//     let productId = req.session.productId;
//     let variantId = req.session.variantId;
//     let user = req.session.user;
//     let userId = user._id;
//     userId = new mongoose.Types.ObjectId(userId);

//     const productStockQuantity = await cartServices.checkProductStockQuantity(
//       productId,
//       variantId,
//     );
//     let stockQuantity = productStockQuantity.variants[0].stockQuantity;

//     const productVariant = await cartServices.findVariantInCart(
//       userId,
//       variantId,
//     );

//     if (stockQuantity == 0 && productVariant) {
//       console.log('stock quantity is 0');
//     }
//   } catch (error) {
//     logger.error('Error', error);
//     return res.redirect('/pageNotFound');
//   }
// };

module.exports = {
  cartPage,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
};
