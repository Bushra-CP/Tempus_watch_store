import logger from '../../utils/logger.js';
import userAddressServices from '../../services/user/userAddressServices.js';
import userProfileServices from '../../services/user/userProfileServices.js';
import cartServices from '../../services/user/cartServices.js';
import checkoutServices from '../../services/user/checkoutServices.js';
import orderServices from '../../services/user/orderServices.js';
import couponServices from '../../services/user/couponServices.js';
import userServices from '../../services/user/userServices.js';
import addressServices from '../../services/user/userAddressServices.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import razorpay from '../../config/razorpay.js';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';

const checkoutPage = async (req, res) => {
  try {
    req.session.couponUrl = '/checkout';
    let user = req.session.user;
    let userId = user._id;
    let userName = user.name;
    let email = user.email;
    let phoneNo = user.phoneNo ? user.phoneNo : '';
    let userData = {
      userId,
      userName,
      email,
      phoneNo,
    };
    req.session.url = '/checkout';
    userId = new mongoose.Types.ObjectId(String(userId));

    let userDetails = await userServices.findUserById(userId);

    let userAddresses = await userProfileServices.getUserAddresses(userId);

    if (userAddresses) {
      let defaultAddressId = userAddresses.addresses
        .filter((x) => x.isDefault === true)
        .map((y) => y._id.toString());
      // console.log('default:', defaultAddressId[0]);
      req.session.addressId = defaultAddressId[0];
    }
    let checkoutItems = await checkoutServices.listCheckoutItems(userId);

    const cartItems = await cartServices.listCartItems(userId);

    let subTotal = checkoutItems.items.reduce(
      (acc, curr) => acc + curr.total,
      0,
    );
    let shippingCharge = 20;
    let discount = cartItems.couponApplied?.couponAmount || 0;

    let orderTotal = subTotal + shippingCharge - discount;

    req.session.subTotal = subTotal;
    req.session.orderTotal = orderTotal;

    //console.log('checkoutItems:', checkoutItems);

    const coupons = await couponServices.fetchCoupons();

    res.render('checkOut', {
      userAddresses,
      userDetails,
      checkoutItems,
      userData,
      subTotal,
      discount,
      orderTotal,
      coupons,
      cartItems,
    });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const removeAddress = async (req, res) => {
  try {
    let { addressId } = req.body;

    let user = req.session.user;
    let userId = user._id;
    // console.log('userId:', userId);
    // console.log('addressId:', addressId);
    addressId = new mongoose.Types.ObjectId(String(addressId));
    userId = new mongoose.Types.ObjectId(String(userId));

    await userAddressServices.removeAddress(userId, addressId);

    res.json({
      success: true,
      redirect: '/checkout',
      message: 'Address Removed',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const getCheckoutAddress = async (req, res) => {
  try {
    let addressId = req.query.id;
    req.session.addressId = addressId;
    console.log('newly selected addressId:', req.session.addressId);
    req.session.save(() => {
      // ensure session is saved
      res.json({ success: true, message: 'Address updated', addressId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { orderTotal, paymentMethod, useWallet } = req.body;
    const userId = new mongoose.Types.ObjectId(String(req.session.user._id));

    //  Validate Stock
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
        return res.json({
          success: false,
          redirect: '/cart',
          message: `The product - ${isProductExists.productName} - is either removed or unlisted..!`,
        });
      }

      const productStockQuantity = await cartServices.checkProductStockQuantity(
        productId,
        variantId,
      );

      const stockQuantity = productStockQuantity.variants[0].stockQuantity;

      if (stockQuantity <= 0) {
        return res.json({
          success: false,
          redirect: '/cart',
          message: `${item.productName} is out of stock..!`,
        });
      } else if (item.quantity > stockQuantity) {
        return res.json({
          success: false,
          redirect: '/cart',
          message: `There are only ${stockQuantity} pieces left for ${item.productName}..!`,
        });
      }
    }

    let findAddress = await addressServices.findUser(userId);
    if (!findAddress) {
      return res.json({
        success: false,
        redirect: '/checkout',
        message: 'Add a delivery address!',
      });
    }

    // Validate Payment Selection

    if (!paymentMethod && !useWallet) {
      return res.json({
        success: false,
        redirect: '/checkout',
        message: 'Select a payment method',
      });
    }

    // Prepare User & Address Data

    const { subTotal } = req.session;
    const { name: userName, email, phoneNo = '' } = req.session.user;

    const addressId = new mongoose.Types.ObjectId(
      String(req.session.addressId),
    );
    const address = await checkoutServices.getAddress(userId, addressId);

    const shippingAddress = {
      country: address.addresses[0].country,
      name: address.addresses[0].name,
      phoneNo: address.addresses[0].phoneNo,
      addressLine: address.addresses[0].addressLine,
      landmark: address.addresses[0].landmark,
      townCity: address.addresses[0].townCity,
      state: address.addresses[0].state,
      pincode: address.addresses[0].pincode,
      addressType: address.addresses[0].addressType,
    };

    // Generate Order Number

    const orderNum = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortUUID = crypto.randomUUID().split('-')[0];
      return `TEMPUS-${date}-${shortUUID}`;
    };
    const orderNumber = orderNum();
    req.session.orderNumber = orderNumber;

    // Wallet & Payment Method Handling

    let paymentMode = paymentMethod;
    let amountToPayViaRazorpay = orderTotal;

    const userDetails = await userServices.findUserById(userId);
    const walletBalance = userDetails.wallet.balance;
    let walletPay;

    if (useWallet) {
      if (walletBalance >= orderTotal) {
        amountToPayViaRazorpay = 0;
        paymentMode = 'WALLET_ONLY';

        walletPay = orderTotal;
        await checkoutServices.changeWalletBalance(userId, walletPay);
      } else {
        amountToPayViaRazorpay = orderTotal - walletBalance;
        if (paymentMethod === 'COD') {
          if (amountToPayViaRazorpay > 1000) {
            return res.json({
              success: false,
              redirect: '/checkout',
              message: 'Order above Rs 1000 is not be allowed for COD',
            });
          }

          paymentMode = 'WALLET_PLUS_COD';
          walletPay = walletBalance;
          await checkoutServices.changeWalletBalance(userId, walletPay);
        }
        if (paymentMethod === 'ONLINE') {
          paymentMode = 'WALLET_PLUS_ONLINE';
          walletPay = walletBalance;
          await checkoutServices.changeWalletBalance(userId, walletPay);
        }
      }
    } else {
      if (paymentMethod === 'COD') {
        if (amountToPayViaRazorpay > 1000) {
          return res.json({
            success: false,
            redirect: '/checkout',
            message: 'Order above Rs 1000 is not be allowed for COD',
          });
        }
        paymentMode = 'COD';
      }
      if (paymentMethod === 'ONLINE') paymentMode = 'ONLINE';
    }

    // Razorpay Order Creation (if needed)

    let razorpayOrder = null;
    if (
      amountToPayViaRazorpay > 0 &&
      (paymentMode === 'ONLINE' || paymentMode === 'WALLET_PLUS_ONLINE')
    ) {
      req.session.paymentMethod = paymentMode;

      razorpayOrder = await razorpay.orders.create({
        amount: amountToPayViaRazorpay * 100,
        currency: 'INR',
        receipt: 'rcpt_' + Date.now(),
      });

      // to complete Razorpay payment

      return res.json({
        success: true,
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order: razorpayOrder,
      });
    }

    // Prepare Order Items (If not using razor pay)

    let orderItems = [];

    for (const item of checkoutItems.items) {
      let details = {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        discount: item.discount,
        finalDiscountedPrice: item.finalDiscountedPrice,
        variantDetails: {
          strapMaterial: item.variantDetails.strapMaterial,
          strapColor: item.variantDetails.strapColor,
          dialColor: item.variantDetails.dialColor,
          caseSize: item.variantDetails.caseSize,
          movementType: item.variantDetails.movementType,
          caseMaterial: item.variantDetails.caseMaterial,
          variantImages: item.variantDetails.variantImages,
        },
      };

      await checkoutServices.reduceProductsQuantity({
        productId: details.productId,
        variantId: details.variantId,
        quantity: details.quantity,
      });

      orderItems.push(details);
    }

    // fetching coupon applied details
    let couponApplied = checkoutItems.couponApplied;

    //total products ordered
    const totalProducts = checkoutItems.items.length;

    // Save Order in Database

    const orderDetails = {
      orderNumber,
      shippingAddress,
      paymentMethod: paymentMode,
      orderItems,
      totalProducts,
      couponApplied,
      subTotal,
      discount: checkoutItems.couponApplied.couponAmount,
      orderTotal,
      orderTotalAfterProductReturn: orderTotal,
    };

    const isUser = await checkoutServices.findUserInOrder(userId);
    if (isUser) {
      await checkoutServices.addMoreToOrder(userId, orderDetails);
    } else {
      await checkoutServices.addCheckoutDetails(
        userId,
        userName,
        email,
        phoneNo,
        orderDetails,
      );
    }

    // 9. Final Response (Wallet or COD orders)
    if (paymentMode == 'WALLET_ONLY') {
      res.json({
        success: true,
        paymentType: 'WALLET_ONLY',
        redirect: '/orderSuccessful',
        message: 'Order Placed',
      });
    }
    if (paymentMode == 'COD') {
      res.json({
        success: true,
        paymentType: 'COD',
        redirect: '/orderSuccessful',
        message: 'Order Placed',
      });
    }
    if (paymentMode == 'WALLET_PLUS_COD') {
      res.json({
        success: true,
        paymentType: 'WALLET_PLUS_COD',
        redirect: '/orderSuccessful',
        message: 'Order Placed',
      });
    }

    // save orderTotal for later verification
    req.session.orderTotal = amountToPayViaRazorpay;
    req.session.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
};

///////// 👇 If going for razor pay//////////
const checkout = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    let addressId = req.session.addressId;
    let subTotal = req.session.subTotal;
    let orderTotal = req.session.orderTotal;
    let user = req.session.user;
    let userId = user._id;
    let userName = user.name;
    let email = user.email;
    let phoneNo = user.phoneNo ? user.phoneNo : '';

    addressId = new mongoose.Types.ObjectId(String(addressId));
    userId = new mongoose.Types.ObjectId(String(userId));

    const secret = process.env.RAZORPAY_KEY_SECRET;

    /////GENERATE ORDER NUMBER
    const orderNum = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortUUID = crypto.randomUUID().split('-')[0];
      return `TEMPUS-${date}-${shortUUID}`;
    };

    const orderNumber = orderNum();
    req.session.orderNumber = orderNumber;

    // Fetch address details
    const address = await checkoutServices.getAddress(userId, addressId);

    const shippingAddress = {
      country: address.addresses[0].country,
      name: address.addresses[0].name,
      phoneNo: address.addresses[0].phoneNo,
      addressLine: address.addresses[0].addressLine,
      landmark: address.addresses[0].landmark,
      townCity: address.addresses[0].townCity,
      state: address.addresses[0].state,
      pincode: address.addresses[0].pincode,
      addressType: address.addresses[0].addressType,
    };

    const paymentMethod = req.session.paymentMethod;

    const checkoutItems = await checkoutServices.listCheckoutItems(userId);
    let orderItems = [];

    for (const item of checkoutItems.items) {
      let details = {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        discount: item.discount,
        finalDiscountedPrice: item.finalDiscountedPrice,
        variantDetails: {
          strapMaterial: item.variantDetails.strapMaterial,
          strapColor: item.variantDetails.strapColor,
          dialColor: item.variantDetails.dialColor,
          caseSize: item.variantDetails.caseSize,
          movementType: item.variantDetails.movementType,
          caseMaterial: item.variantDetails.caseMaterial,
          variantImages: item.variantDetails.variantImages,
        },
      };

      orderItems.push(details);
    }

    // fetching coupon applied details
    const couponApplied = checkoutItems.couponApplied;

    //total products ordered
    const totalProducts = checkoutItems.items.length;

    let razorpayDetails = {
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature: razorpay_signature,
    };

    //Handling failed payments  -
    if (!razorpay_signature) {
      const orderDetails = {
        orderNumber,
        shippingAddress,
        paymentMethod,
        orderItems,
        totalProducts,
        couponApplied,
        subTotal,
        discount: checkoutItems.couponApplied.couponAmount,
        orderTotal,
        orderTotalAfterProductReturn: orderTotal,
        razorpayDetails,
        status: 'failed',
        paymentStatus: 'failed',
      };

      const isUser = await checkoutServices.findUserInOrder(userId);
      if (isUser) {
        await checkoutServices.addMoreToOrderFailedOrder(
          userId,
          orderDetails,
          razorpay_order_id,
        );
      } else {
        await checkoutServices.addCheckoutDetailsFailedOrder(
          userId,
          userName,
          email,
          phoneNo,
          orderDetails,
        );
      }

      return res.json({
        status: 'failed',
        redirect: '/orderFailed',
        message: 'Payment Failed',
      });
    }

    //Verify successful payment signature -
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      const orderDetails = {
        orderNumber,
        shippingAddress,
        paymentMethod,
        orderItems,
        totalProducts,
        couponApplied,
        subTotal,
        discount: checkoutItems.couponApplied.couponAmount,
        orderTotal,
        orderTotalAfterProductReturn: orderTotal,
        razorpayDetails,
        status: 'failed',
        paymentStatus: 'failed',
      };

      const isUser = await checkoutServices.findUserInOrder(userId);
      if (isUser) {
        await checkoutServices.addMoreToOrderFailedOrder(
          userId,
          orderDetails,
          razorpay_order_id,
        );
      } else {
        await checkoutServices.addCheckoutDetailsFailedOrder(
          userId,
          userName,
          email,
          phoneNo,
          orderDetails,
        );
      }

      return res.json({
        status: 'failed',
        redirect: '/orderFailed',
        message: 'Invalid signature – Payment verification failed',
      });
    }

    // ✅ Valid payment - reduce stock and confirm
    for (const item of checkoutItems.items) {
      await checkoutServices.reduceProductsQuantity({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const orderDetails = {
      orderNumber,
      shippingAddress,
      paymentMethod,
      orderItems,
      totalProducts,
      couponApplied,
      subTotal,
      discount: checkoutItems.couponApplied.couponAmount,
      orderTotal,
      orderTotalAfterProductReturn: orderTotal,
      razorpayDetails,
      paymentStatus: 'success',
    };

    const isUser = await checkoutServices.findUserInOrder(userId);
    if (isUser) {
      await checkoutServices.addMoreToOrder(userId, orderDetails);
    } else {
      await checkoutServices.addCheckoutDetails(
        userId,
        userName,
        email,
        phoneNo,
        orderDetails,
      );
    }

    res.json({
      success: true,
      redirect: '/orderSuccessful',
      message: 'Order Placed with Razor pay',
    });
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const thankPage = async (req, res) => {
  try {
    let orderNumber = req.session.orderNumber;
    let order = await orderServices.getByOrderNumber(orderNumber);
    //console.log(order);
    res.render('thankYou', { order });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

const failurePage = async (req, res) => {
  try {
    let orderTotal = req.session.orderTotal;
    //console.log(order);
    res.render('orderFailurePage', { orderTotal });
  } catch (error) {
    logger.error('Error', error);
    return res.redirect('/pageNotFound');
  }
};

export default {
  checkoutPage,
  removeAddress,
  createRazorpayOrder,
  checkout,
  getCheckoutAddress,
  thankPage,
  failurePage,
};
