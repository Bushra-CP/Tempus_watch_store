import Products from '../../models/productSchema.js';
import Category from '../../models/categorySchema.js';
import ProductOffer from '../../models/productOfferSchema.js';
import session from 'express-session';
import mongoose from 'mongoose';

const categoryNames = async () => {
  return await Category.find({}, { categoryName: 1, _id: 1 });
};

const productsFetch = async (search, page, limit) => {
  let query = {};
  let skip = (page - 1) * limit;

  if (search) {
    query = { productName: { $regex: search, $options: 'i' } };
  }

  const productList = await Products.find(query)
    .populate('category', 'categoryName _id')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  ////////////////////////////////////////////////////////////////////
  /*populate('category', 'categoryName _id') replaces the category ID 
  with the category document’s categoryName and _id */
  ////////////////////////////////////////////////////////////////////

  const total = await Products.countDocuments(query);

  return { productList, totalPages: Math.ceil(total / limit) };
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

const updateVariant = async (productId, variantId, updateFields) => {
  const updateData = {
    'variants.$.strapMaterial': updateFields.strapMaterial,
    'variants.$.strapColor': updateFields.strapColor,
    'variants.$.dialColor': updateFields.dialColor,
    'variants.$.caseSize': updateFields.caseSize,
    'variants.$.movementType': updateFields.movementType,
    'variants.$.caseMaterial': updateFields.caseMaterial,
    'variants.$.stockQuantity': updateFields.stockQuantity,
    'variants.$.actualPrice': updateFields.actualPrice,
    'variants.$.offerPrice': updateFields.offerPrice,
  };

  await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $set: updateData },
  );

  // append new images if provided
  if (updateFields.variantImages && updateFields.variantImages.length > 0) {
    await Products.updateOne(
      { _id: productId, 'variants._id': variantId },
      {
        $push: {
          'variants.$.variantImages': { $each: updateFields.variantImages },
        },
      },
    );
  }
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

const addVariant = async (productId, finalVariants) => {
  const product = await Products.findById(productId);
  const updatedVariants = [...product.variants, ...finalVariants]; // append

  return await Products.updateOne(
    { _id: productId },
    {
      $set: {
        variants: updatedVariants,
      },
    },
  );
};

const productsEdit = async (
  productId,
  productName,
  description,
  brand,
  category,
) => {
  return await Products.updateOne(
    { _id: productId },
    { $set: { productName, description, brand, category } },
  );
};

const imageRemove = async (productId, variantId, index) => {
  await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $unset: { [`variants.$.variantImages.${index}`]: 1 } },
  );

  await Products.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $pull: { 'variants.$.variantImages': null } },
  );
};

const findProductOffer = async () => {
  return await ProductOffer.find({});
};

export default {
  categoryNames,
  productsFetch,
  productsAdd,
  variantUnlist,
  variantList,
  editVariant,
  updateVariant,
  productUnlist,
  productList,
  getProduct,
  addVariant,
  productsEdit,
  imageRemove,
  findProductOffer,
};
