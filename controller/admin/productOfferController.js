import logger from '../../utils/logger.js';
import productOfferServices from '../../services/admin/productOfferServices.js';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';

const addProductOffer = async (req, res) => {
  try {
    console.log(req.body);
    let {
      productId,
      productName,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (
      !offerTitle ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate ||
      !status
    ) {
      req.flash('error_msg', messages.ALL_FIELDS_REQUIRED);
      return res.redirect('/admin/category');
    }

    // ✅ Validate discount value
    if (isNaN(discountValue) || discountValue <= 0) {
      req.flash('error_msg', messages.DISCOUNT_VALUE);
      return res.redirect('/admin/category');
    }

    if (discountType === 'percentage' && discountValue > 100) {
      req.flash('error_msg', messages.PERCENTAGE_ERROR);
      return res.redirect('/admin/category');
    }

    // ✅ Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      req.flash('error_msg', messages.DATES_MISMATCH);
      return res.redirect('/admin/category');
    }

    ////////*/FORM VALIDATION/*////////

    productId = new mongoose.Types.ObjectId(String(productId));
    await productOfferServices.addProductOffer(
      productId,
      productName,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    );
    req.flash('success_msg', messages.OFFER_ADDED);
    return res.redirect('/admin/products');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editProductOffer = async (req, res) => {
  try {
    console.log(req.body);
    let {
      productId,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (
      !offerTitle ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate ||
      !status
    ) {
      req.flash('error_msg', messages.ALL_FIELDS_REQUIRED);
      return res.redirect('/admin/category');
    }

    // ✅ Validate discount value
    if (isNaN(discountValue) || discountValue <= 0) {
      req.flash('error_msg', messages.DISCOUNT_VALUE);
      return res.redirect('/admin/category');
    }

    if (discountType === 'percentage' && discountValue > 100) {
      req.flash('error_msg', messages.PERCENTAGE_ERROR);
      return res.redirect('/admin/category');
    }

    // ✅ Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      req.flash('error_msg', messages.DATES_MISMATCH);
      return res.redirect('/admin/category');
    }

    ////////*/FORM VALIDATION/*////////

    productId = new mongoose.Types.ObjectId(productId);
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    await productOfferServices.editProductOffer(
      productId,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    );
    req.flash('success_msg', messages.PRODUCT_EDITED);
    if (req.session.productOfferEditUrl == '/admin/productOffers') {
      return res.redirect('/admin/productOffers');
    }
    return res.redirect('/admin/products');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const productOfferPage = async (req, res) => {
  try {
    req.session.productOfferEditUrl = '/admin/productOffers';
    let search = req.query.search || '';
    const productOffers = await productOfferServices.fetchProductOffers(search);
    // console.log(productOffers);

    return res.render('productOffer', { productOffers, search });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const removeOffer = async (req, res) => {
  try {
    //console.log(req.body);
    let { offerId } = req.body;
    offerId = new mongoose.Types.ObjectId(String(offerId));

    await productOfferServices.removeOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
      message: messages.OFFER_REMOVED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const deactivateOffer = async (req, res) => {
  try {
    //console.log(req.body);
    let { offerId } = req.body;
    offerId = new mongoose.Types.ObjectId(String(offerId));

    await productOfferServices.deactivateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
      message: messages.OFFER_DEACIVATED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const activateOffer = async (req, res) => {
  try {
    //console.log(req.body);
    let { offerId } = req.body;
    offerId = new mongoose.Types.ObjectId(String(offerId));

    await productOfferServices.activateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
      message: messages.OFFER_ACTIVATED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  addProductOffer,
  editProductOffer,
  productOfferPage,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
