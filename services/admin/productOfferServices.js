const ProductOffer = require('../../models/productOfferSchema');
const Category = require('../../models/categorySchema');
const Products = require('../../models/productSchema');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const addProductOffer = async (
  productId,
  productName,
  offerTitle,
  discountType,
  discountValue,
  startDate,
  endDate,
  status,
) => {
  let productOffer = new ProductOffer({
    productId,
    productName,
    offerTitle,
    discountType,
    discountValue,
    startDate,
    endDate,
    status,
  });
  return await productOffer.save();
};

const editProductOffer = async (
  productId,
  offerTitle,
  discountType,
  discountValue,
  startDate,
  endDate,
  status,
) => {
  return await ProductOffer.updateOne(
    { productId },
    {
      $set: {
        offerTitle,
        discountType,
        discountValue,
        startDate,
        endDate,
        status,
      },
    },
  );
};

const fetchProductOffers = async (search) => {
  let query = {};
  if (search) {
    query.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { offerTitle: { $regex: search, $options: 'i' } },
    ];
  }
  return await ProductOffer.find(query)
    .populate('productId', 'productName _id')
    .sort({ createdAt: -1 });
};

const removeOffer = async (offerId) => {
  return await ProductOffer.deleteOne({ _id: offerId });
};

const deactivateOffer = async (offerId) => {
  await ProductOffer.updateOne(
    { _id: offerId },
    { $set: { status: 'inactive' } },
  );
};

const activateOffer = async (offerId) => {
  return await ProductOffer.updateOne(
    { _id: offerId },
    { $set: { status: 'active' } },
  );
};

module.exports = {
  addProductOffer,
  editProductOffer,
  fetchProductOffers,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
