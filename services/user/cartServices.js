const User = require('../../models/userSchema');
const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const Cart = require('../../models/cartSchema');
const logger = require('../../utils/logger');

const productDetails = async (productId,variantId) => {
  const product= await Products.findById({ _id: productId }).populate(
    'category',
    'categoryName',
  );
  const variant=product.variants.id(variantId);
  return {product,variant};
};



module.exports = {productDetails};
