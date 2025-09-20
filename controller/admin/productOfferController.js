const logger = require('../../utils/logger');
const productOfferServices = require('../../services/admin/productOfferServices');
const session = require('express-session');
const mongoose = require('mongoose');

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
    productId = new mongoose.Types.ObjectId(productId);
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
    req.flash('success_msg', 'Product offer added!');
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
    req.flash('success_msg', 'Product offer edited!');
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
    offerId = new mongoose.Types.ObjectId(offerId);

    await productOfferServices.removeOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
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

    await productOfferServices.deactivateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
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

    await productOfferServices.activateOffer(offerId);

    res.json({
      success: true,
      redirect: '/admin/productOffers',
      message: 'Offer Activated',
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  addProductOffer,
  editProductOffer,
  productOfferPage,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
