import Products from '../../models/productSchema.js';
import Category from '../../models/categorySchema.js';
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

const latestProducts = async () => {
  return await Products.find({}).sort({ createdAt: -1 }).limit(8);
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

export default {
  latestProducts,
  productDetails,
};
