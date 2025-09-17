const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const session = require('express-session');
const mongoose = require('mongoose');

const categoryNames = async () => {
  return await Category.find({}, { categoryName: 1, _id: 1 });
};

const productsFetch = async (search, page, limit, filter) => {
  let query = {};
  let skip = (page - 1) * limit;

  if (search) {
    query = { productName: { $regex: search, $options: 'i' } };
  }

  switch (filter) {
    case 'low_stock':
      query['variants.stockQuantity'] = { $lt: 5, $gt: 0 };
      break;

    case 'out_of_stock':
      query['variants.stockQuantity'] = { $lte: 0 };
      break;

    case 'all':
      break;
  }

  let sortOption = {};
  if (filter === 'low_stock') {
    sortOption['variants.stockQuantity'] = 1;
  } else {
    sortOption['createdAt'] = -1;
  }

  const productList = await Products.find(query)
    .populate('category', 'categoryName _id')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Products.countDocuments(query);

  return { productList, totalPages: Math.ceil(total / limit) };
};

const editStock = async (productId, variantId, stockQuantity) => {
  return await Products.updateOne(
    {
      _id: productId,
      'variants._id': variantId,
    },
    { $set: { 'variants.$.stockQuantity': stockQuantity } },
  );
};

module.exports = {
  categoryNames,
  productsFetch,
  editStock
};
