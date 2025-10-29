import CategoryOffer from '../../models/categoryOfferSchema.js';
import Category from '../../models/categorySchema.js';
import Products from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const addCategoryOffer = async (
  categoryId,
  categoryName,
  offerTitle,
  discountType,
  discountValue,
  startDate,
  endDate,
  status,
) => {
  let categoryOffer = new CategoryOffer({
    categoryId,
    categoryName,
    offerTitle,
    discountType,
    discountValue,
    startDate,
    endDate,
    status,
  });
  return await categoryOffer.save();
};

const editCategoryOffer = async (
  categoryId,
  offerTitle,
  discountType,
  discountValue,
  startDate,
  endDate,
  status,
) => {
  return await CategoryOffer.updateOne(
    { categoryId },
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

const fetchCategoryOffers = async (search) => {
  let query = {};
  if (search) {
    query.$or = [
      { categoryName: { $regex: search, $options: 'i' } },
      { offerTitle: { $regex: search, $options: 'i' } },
    ];
  }
  return await CategoryOffer.find(query)
    .populate('categoryId', 'categoryName _id')
    .sort({ createdAt: -1 });
};

const removeOffer = async (offerId) => {
  return await CategoryOffer.deleteOne({ _id: offerId });
};

const deactivateOffer = async (offerId) => {
  await CategoryOffer.updateOne(
    { _id: offerId },
    { $set: { status: 'inactive' } },
  );
};

const activateOffer = async (offerId) => {
  return await CategoryOffer.updateOne(
    { _id: offerId },
    { $set: { status: 'active' } },
  );
};

export default {
  addCategoryOffer,
  editCategoryOffer,
  fetchCategoryOffers,
  removeOffer,
  deactivateOffer,
  activateOffer,
};
