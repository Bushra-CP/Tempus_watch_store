import logger from '../../utils/logger.js';
import cartServices from '../../services/user/cartServices.js';
import checkoutServices from '../../services/user/checkoutServices.js';
import wishlistServices from '../../services/user/wishlistServices.js';
import couponServices from '../../services/user/couponServices.js';
import User from '../../models/userSchema.js';
import mongoose from 'mongoose';

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
      userId = new mongoose.Types.ObjectId(String(userId));

      let { productId, variantId, price, quantity } = req.body;
      //console.log(req.body);

      productId = new mongoose.Types.ObjectId(String(productId));
      variantId = new mongoose.Types.ObjectId(String(variantId));

      await wishlistServices.removeFromWishllist(userId, productId);

      const isProductExists = await cartServices.isProductExists(
        productId,
        variantId,
      );

      //console.log('isProduct:',isProductExists);

      if (!isProductExists) {
        return res.json({
          success: false,
          message: 'This product is either removed or unlisted..!',
        });
      }

      if (isProductExists && isProductExists.isListed == false) {
        return res.json({
          success: false,
          message: 'This product is either removed or unlisted..!',
        });
      }

      if (isProductExists && isProductExists.variants[0].isListed == false) {
        return res.json({
          success: false,
          message: 'This product is either removed or unlisted..!',
        });
      }

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

              await cartServices.removeCoupon(userId);
            }
          } else {
            await cartServices.addMoreToCart(
              userId,
              productId,
              variantId,
              cartItem,
            );
            await cartServices.removeCoupon(userId);
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
    req.session.couponUrl = '/cart';

    const user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user._id });

      if (userData.isBlocked) {
        req.flash('error_msg', 'Your account is blocked by admin!');
        return res.redirect('/logout');
      }

      let userId = user._id;
      userId = new mongoose.Types.ObjectId(String(userId));

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

      const coupons = await couponServices.fetchCoupons();

      return res.render('cart', { cartItems, coupons });
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

    userId = new mongoose.Types.ObjectId(String(userId));
    productId = new mongoose.Types.ObjectId(String(productId));
    variantId = new mongoose.Types.ObjectId(String(variantId));

    const productStockQuantity = await cartServices.checkProductStockQuantity(
      productId,
      variantId,
    );
    let stockQuantity = productStockQuantity.variants[0].stockQuantity;

    const cartQuantity = await cartServices.checkQuantityInCart(
      userId,
      variantId,
    );

    const quantityInCart = cartQuantity.items[0].quantity;

    const isProductExists = await cartServices.isProductExists(
      productId,
      variantId,
    );

    if (
      !isProductExists ||
      isProductExists.isListed === false ||
      isProductExists.variants?.[0]?.isListed === false
    ) {
      await cartServices.removeVariantFromCart(
        userId,
        productId,
        variantId,
        quantityInCart,
      );

      await cartServices.removeCoupon(userId);

      req.flash('error_msg', 'This product is either removed or unlisted..!');
      return res.redirect('/cart');
    }

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
      await cartServices.removeCoupon(userId);

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
    userId = new mongoose.Types.ObjectId(String(userId));
    productId = new mongoose.Types.ObjectId(String(productId));
    variantId = new mongoose.Types.ObjectId(String(variantId));

    const cartQuantity = await cartServices.checkQuantityInCart(
      userId,
      variantId,
    );

    const quantityInCart = cartQuantity.items[0].quantity;

    const isProductExists = await cartServices.isProductExists(
      productId,
      variantId,
    );

    if (
      !isProductExists ||
      isProductExists.isListed === false ||
      isProductExists.variants?.[0]?.isListed === false
    ) {
      await cartServices.removeVariantFromCart(
        userId,
        productId,
        variantId,
        quantityInCart,
      );
      await cartServices.removeCoupon(userId);

      req.flash('error_msg', 'This product is either removed or unlisted..!');
      return res.redirect('/cart');
    }

    const quantity = -1;
    await cartServices.removeCoupon(userId);

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

    userId = new mongoose.Types.ObjectId(String(userId));
    productId = new mongoose.Types.ObjectId(String(productId));
    variantId = new mongoose.Types.ObjectId(String(variantId));

    await cartServices.removeVariantFromCart(
      userId,
      productId,
      variantId,
      quantity,
    );
    await cartServices.removeCoupon(userId);

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

const goToCheckout = async (req, res) => {
  const user = req.session.user;
  const userId = new mongoose.Types.ObjectId(String(user._id));

  //  fetch cart items to check if eligible for checkout
  const checkoutItems = await checkoutServices.listCheckoutItems(userId);

  for (const item of checkoutItems.items) {
    const productId = item.productId;
    const variantId = item.variantId;

    const cartQuantity = await cartServices.checkQuantityInCart(
      userId,
      variantId,
    );

    const quantityInCart = cartQuantity.items[0].quantity;

    const isProductExists = await cartServices.isProductExists(
      productId,
      variantId,
    );

    if (
      !isProductExists ||
      isProductExists.isListed === false ||
      isProductExists.variants?.[0]?.isListed === false
    ) {
      await cartServices.removeVariantFromCart(
        userId,
        productId,
        variantId,
        quantityInCart,
      );

      req.flash(
        'error_msg',
        `The product - ${isProductExists.productName} - is either removed or unlisted..!`,
      );
      return res.redirect('/cart');
    }

    const productStockQuantity = await cartServices.checkProductStockQuantity(
      productId,
      variantId,
    );

    const stockQuantity = productStockQuantity.variants[0].stockQuantity;

    if (stockQuantity <= 0) {
      req.flash('error_msg', `${item.productName} is out of stock..!`);
      return res.redirect('/cart');
    } else if (item.quantity > stockQuantity) {
      req.flash(
        'error_msg',
        `There are only ${stockQuantity} pieces left for ${item.productName}..!`,
      );
      return res.redirect('/cart');
    }
  }

  return res.redirect('/checkout');
};

export default {
  cartPage,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  goToCheckout,
};
