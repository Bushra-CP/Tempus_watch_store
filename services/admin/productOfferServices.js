import ProductOffer from '../../models/productOfferSchema.js';
import Category from '../../models/categorySchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

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

export default {
  addProductOffer,
  editProductOffer,
  fetchProductOffers,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
