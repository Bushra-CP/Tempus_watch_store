const logger = require('../../utils/logger');
const categoryOfferServices = require('../../services/admin/categoryOfferServices');
const session = require('express-session');
const mongoose = require('mongoose');
const messages = require('../../config/messages');
const statusCode = require('../../config/statusCodes');

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
    categoryId = new mongoose.Types.ObjectId(categoryId);
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
    req.flash('success_msg', messages.CAT_OFFER_ADDED);
    return res.redirect('/admin/category');
  } catch (error) {
    logger.error('page not found', error);
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
    categoryId = new mongoose.Types.ObjectId(categoryId);
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
    req.flash('success_msg', messages.CAT_OFFER_EDITED);
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
    offerId = new mongoose.Types.ObjectId(offerId);

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
    offerId = new mongoose.Types.ObjectId(offerId);

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
    offerId = new mongoose.Types.ObjectId(offerId);

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

module.exports = {
  addCategoryOffer,
  editCategoryOffer,
  categoryOfferPage,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
