import Category from '../../models/categorySchema.js';
import CategoryOffer from '../../models/categoryOfferSchema.js';
import session from 'express-session';

const findCategoryByName = async (categoryName) => {
  return await Category.findOne({
    categoryName: { $regex: '^' + categoryName + '$', $options: 'i' },
  });
};

const findCategoryById = async (categoryId) => {
  return await Category.findById({ _id: categoryId });
};

const createCategory = async (categoryData) => {
  const newCategory = new Category({
    categoryName: categoryData.categoryName,
    description: categoryData.description,
    image: categoryData.image_url,
  });
  return await newCategory.save();
};

const listCategory = async (search, page, limit, status) => {
  let query = {};

  if (status == 'activated') {
    query = { isActive: true };
  } else if (status == 'deactivated') {
    query = { isActive: false };
  }

  let skip = (page - 1) * limit;

  if (search) {
    query = { categoryName: { $regex: search, $options: 'i' } };
  }
  const category = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);
  return { category, totalPages: Math.ceil(total / limit) };
};

const categoryDeactivate = async (category_id) => {
  return await Category.findByIdAndUpdate(
    { _id: category_id },
    { $set: { isActive: false } },
  );
};

const categoryActivate = async (category_id) => {
  return await Category.findByIdAndUpdate(
    { _id: category_id },
    { $set: { isActive: true } },
  );
};

const editCategory = async (category_id, updateData) => {
  const updateFields = {
    categoryName: updateData.categoryName,
    description: updateData.description,
  };

  if (updateData.image) {
    updateFields.image = updateData.image;
  }

  return await Category.updateOne({ _id: category_id }, { $set: updateFields });
};

const findCategoryOffer = async () => {
  return await CategoryOffer.find({});
};

export default {
  findCategoryByName,
  findCategoryById,
  createCategory,
  listCategory,
  categoryDeactivate,
  categoryActivate,
  editCategory,
  findCategoryOffer,
};
