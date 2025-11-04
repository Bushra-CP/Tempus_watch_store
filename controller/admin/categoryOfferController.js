import logger from '../../utils/logger.js';
import categoryOfferServices from '../../services/admin/categoryOfferServices.js';
import session from 'express-session';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';

const addCategoryOffer = async (req, res) => {
  try {
    //console.log(req.body);
    let {
      categoryId,
      categoryName,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    } = req.body;

    ////////*/FORM VALIDATION/*////////

    if (
      !categoryId ||
      !categoryName ||
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

    categoryId = new mongoose.Types.ObjectId(String(categoryId));
    await categoryOfferServices.addCategoryOffer(
      categoryId,
      categoryName,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    );
    req.flash('success_msg', messages.OFFER_ADDED);
    return res.redirect('/admin/category');
  } catch (error) {
    console.log('page not found');
    return res.redirect('/admin/pageNotFound');
  }
};

const editCategoryOffer = async (req, res) => {
  try {
    //console.log(req.body);
    let {
      categoryId,
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

    categoryId = new mongoose.Types.ObjectId(String(categoryId));
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    await categoryOfferServices.editCategoryOffer(
      categoryId,
      offerTitle,
      discountType,
      discountValue,
      startDate,
      endDate,
      status,
    );
    req.flash('success_msg', messages.OFFER_EDITED);
    if (req.session.categoryOfferEditUrl == '/admin/categoryOffers') {
      return res.redirect('/admin/categoryOffers');
    }
    return res.redirect('/admin/category');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const categoryOfferPage = async (req, res) => {
  try {
    req.session.categoryOfferEditUrl = '/admin/categoryOffers';
    let search = req.query.search || '';
    const categoryOffers =
      await categoryOfferServices.fetchCategoryOffers(search);
    // console.log(categoryOffers);

    return res.render('categoryOffer', { categoryOffers, search });
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

    await categoryOfferServices.removeOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/categoryOffers',
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

    await categoryOfferServices.deactivateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/categoryOffers',
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

    await categoryOfferServices.activateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/categoryOffers',
      message: messages.OFFER_ACTIVATED,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  addCategoryOffer,
  editCategoryOffer,
  categoryOfferPage,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
