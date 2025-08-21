const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const session = require('express-session');
const mongoose = require('mongoose');

const categoryNames = async () => {
  return await Category.find({}, { categoryName: 1, _id: 1 });
};

const productsFetch = async () => {
  const productList = await Products.find().populate(
    'category',
    'categoryName _id',
  );
  /*populate('category', 'categoryName _id') replaces the category ID 
  with the category document’s categoryName and _id */
  return productList;
};

const productsAdd = async (
  productName,
  description,
  brand,
  category,
  finalVariants,
) => {
  const newProduct = new Products({
    productName,
    description,
    brand,
    category,
    variants: finalVariants,
  });
  return await newProduct.save();
};

const variantUnlist = async (variant_id) => {
  return await Products.updateOne(
    { 'variants._id': variant_id },
    { $set: { 'variants.$.isListed': false } },
  );
};

const variantList = async (variant_id) => {
  return await Products.updateOne(
    { 'variants._id': variant_id },
    { $set: { 'variants.$.isListed': true } },
  );
};

const editVariant = async (productId, variantId) => {
  const product = await Products.findById({ _id: productId }).populate(
    'category',
    'categoryName',
  );
  const variant = product.variants.id(variantId);
  return { product, variant };
};

const updateVarient = async (productId, variantId, updateFields) => {
  const updateVarient = {
    'variants.$.strapMaterial': updateFields.strapMaterial,
    'variants.$.strapColor': updateFields.strapColor,
    'variants.$.dialColor': updateFields.dialColor,
    'variants.$.caseSize': updateFields.caseSize,
    'variants.$.movementType': updateFields.movementType,
    'variants.$.caseMaterial': updateFields.caseMaterial,
    'variants.$.stockQuantity': updateFields.stockQuantity,
    'variants.$.actualPrice': updateFields.actualPrice,
    'variants.$.offerPrice': updateFields.offerPrice,
    'variants.$.variantImages': updateFields.variantImages,
  };

  return await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $set: updateData },
  );
};

const productUnlist = async (product_id) => {
  return await Products.updateOne(
    { _id: product_id },
    { $set: { isListed: false } },
  );
};

const productList = async (product_id) => {
  return await Products.updateOne(
    { _id: product_id },
    { $set: { isListed: true } },
  );
};

const getProduct = async (product_id) => {
  return await Products.findById({ _id: product_id }).populate(
    'category',
    'categoryName _id',
  );
};

const productsEdit = async (
  productId,
  productName,
  description,
  brand,
  category,
  finalVariants,
) => {
  const product = await Products.findById(productId);
  const updatedVariants = [...product.variants, ...finalVariants];

  await Products.updateOne(
    { _id: productId },
    {
      $set: {
        productName,
        description,
        brand,
        category,
        variants: updatedVariants,
      },
    },
  );
};

module.exports = {
  categoryNames,
  productsFetch,
  productsAdd,
  variantUnlist,
  variantList,
  editVariant,
  updateVarient,
  productUnlist,
  productList,
  getProduct,
  productsEdit,
};
