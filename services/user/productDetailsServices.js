const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const latestProducts = async () => {
  return await Products.find({}).sort({ createdAt: -1 }).limit(4);
};

const productDetails = async (productId, variantId) => {
  const product = await Products.findById({ _id: productId }).populate(
    'category',
    'categoryName',
  );
  const variant = product.variants.id(variantId);
  const checkQuantity = variant.stockQuantity;
  return { product, variant, checkQuantity };
};

module.exports = {
  latestProducts,
  productDetails,
};
