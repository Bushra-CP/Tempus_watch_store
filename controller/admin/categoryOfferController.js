const logger = require('../../utils/logger');
const categoryOfferServices = require('../../services/admin/categoryOfferServices');
const session = require('express-session');
const mongoose = require('mongoose');

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
    req.flash('success_msg', 'Category offer added!');
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
    req.flash('success_msg', 'Category offer edited!');
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
      message: 'Offer Removed',
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
      message: 'Offer Deactivated',
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
      message: 'Offer Activated',
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
