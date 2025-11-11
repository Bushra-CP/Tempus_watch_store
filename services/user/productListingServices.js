import Products from '../../models/productSchema.js';
import Category from '../../models/categorySchema.js';
import ProductOffer from '../../models/productOfferSchema.js';
import CategoryOffer from '../../models/categoryOfferSchema.js';
import Wishlist from '../../models/wishlistSchema.js';
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

const getCategoryId = async (category) => {
  return await Category.find({ category }, { _id: 1 });
};

const productListing = async (
  search,
  page,
  limit,
  category,
  brand,
  price,
  strapColor,
  dialColor,
  caseSize,
  movement,
  sort,
) => {
  let filter = { isListed: true, 'variants.isListed': true };
  const skip = (page - 1) * limit;

  if (category && category.length > 0) {
    filter.category = {
      $in: category.map((id) => new mongoose.Types.ObjectId(String(id))),
    };
  }

  if (brand && brand.length > 0) {
    filter.brand = { $in: brand };
  }

  if (strapColor && strapColor.length > 0) {
    filter['variants.strapColor'] = { $in: strapColor };
  }

  if (dialColor && dialColor.length > 0) {
    filter['variants.dialColor'] = { $in: dialColor };
  }

  if (movement && movement.length > 0) {
    filter['variants.movementType'] = { $in: movement };
  }

  let andConditions = [];

  if (caseSize && caseSize.length > 0) {
    const caseSizeConditions = caseSize.map((c) => {
      const [min, max] = c.split('-').map(Number);
      return { 'variants.caseSize': { $gte: min, $lte: max } };
    });
    andConditions.push({ $or: caseSizeConditions });
  }

  if (price && price.length > 0) {
    const priceConditions = price.map((p) => {
      const [min, max] = p.split('-').map(Number);
      return { 'variants.offerPrice': { $gte: min, $lte: max } };
    });
    andConditions.push({ $or: priceConditions });
  }

  let matchStage =
    Object.keys(filter).length > 0
      ? { $and: [filter, ...andConditions] }
      : { $and: andConditions };

  ///////////////////SEARCH/////////////////////
  function buildSearchRegex(text) {
    // Escape regex special chars first
    let escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Apostrophes optional
    escaped = escaped.replace(/['’]/g, "['’]?");

    escaped = escaped.replace(/s\b/gi, 's?');

    return new RegExp(escaped, 'i'); // case-insensitive
  }

  /////////////////////////////////////////////////

  if (search) {
    let searchRegex = buildSearchRegex(search);

    let matchedCategories = await Category.find(
      { categoryName: searchRegex },
      { _id: 1 },
    ).lean();

    let categoryIds = matchedCategories.map((cat) => cat._id);

    let searchConditions = [
      { productName: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { category: { $in: categoryIds } },
      { 'variants.strapColor': searchRegex },
      { 'variants.dialColor': searchRegex },
      { 'variants.movementType': searchRegex },
    ];

    matchStage.$and.push({ $or: searchConditions });
  }

  ///////////////////SEARCH/////////////////////

  // Sorting logic
  let sortOption = {};
  switch (sort) {
    case 'price-descending':
      sortOption['variants.offerPrice'] = -1;
      break;
    case 'price-ascending':
      sortOption['variants.offerPrice'] = 1;
      break;
    case 'title-ascending':
      sortOption['productName'] = 1;
      break;
    case 'title-descending':
      sortOption['productName'] = -1;
      break;
    default:
      sortOption['updatedAt'] = -1;
  }

  //PRODUCT LIST
  let products = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    {
      $group: {
        _id: '$_id',
        productName: { $first: '$productName' },
        brand: { $first: '$brand' },
        description: { $first: '$description' },
        category: { $first: '$category' },
        variants: { $push: '$variants' },
      },
    },
    // ✅ Calculate minPrice & maxPrice
    {
      $addFields: {
        minPrice: { $min: '$variants.offerPrice' },
        maxPrice: { $max: '$variants.offerPrice' },
      },
    },
    { $sort: sortOption },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    { $match: { 'categoryDetails.isActive': true } },
  ]);

  //TOTAL PRODUCTS
  let totalProducts = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    {
      $group: {
        _id: '$_id',
        productName: { $first: '$productName' },
        brand: { $first: '$brand' },
        description: { $first: '$description' },
        category: { $first: '$category' },
        variants: { $push: '$variants' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    { $match: { 'categoryDetails.isActive': true } },
    { $count: 'total' },
  ]);

  let total = totalProducts.length > 0 ? totalProducts[0].total : 0;

  ///////////////////SIDE BAR/////////////////////

  const basePipeline = [
    { $unwind: '$variants' },
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    { $match: { 'categoryDetails.isActive': true } },
  ];

  let categoryStats = await Products.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    { $match: { 'categoryDetails.isActive': true } },
    {
      $group: {
        _id: '$categoryDetails._id',
        category: { $first: '$categoryDetails.categoryName' },
        count: { $sum: 1 },
      },
    },
  ]);

  let brandStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $project: { brand: '$_id', count: 1, _id: 0 } },
  ]);

  let strapColorStats = await Products.aggregate([
    ...basePipeline,
    { $group: { _id: '$variants.strapColor', count: { $sum: 1 } } },
    { $project: { strapColor: '$_id', count: 1, _id: 0 } },
  ]);

  let dialColorStats = await Products.aggregate([
    ...basePipeline,
    { $group: { _id: '$variants.dialColor', count: { $sum: 1 } } },
    { $project: { dialColor: '$_id', count: 1, _id: 0 } },
  ]);

  let priceStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    {
      $group: {
        _id: '$_id',
        minPrice: { $min: '$variants.offerPrice' },
      },
    },
    {
      $bucket: {
        groupBy: '$minPrice',
        boundaries: [
          0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
        ],
        default: 'Other',
        output: {
          count: { $sum: 1 },
        },
      },
    },
    {
      $addFields: {
        priceRanges: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 0] }, then: '0- 1000' },
              { case: { $eq: ['$_id', 1000] }, then: '1000-2000' },
              { case: { $eq: ['$_id', 2000] }, then: '2000-3000' },
              { case: { $eq: ['$_id', 3000] }, then: '3000-4000' },
              { case: { $eq: ['$_id', 4000] }, then: '4000-5000' },
              { case: { $eq: ['$_id', 5000] }, then: '5000-6000' },
              { case: { $eq: ['$_id', 6000] }, then: '6000-7000' },
              { case: { $eq: ['$_id', 7000] }, then: '7000-8000' },
              { case: { $eq: ['$_id', 8000] }, then: '8000-9000' },
              { case: { $eq: ['$_id', 9000] }, then: '9000-10000' },
            ],
            default: 'Above 10000 / Other',
          },
        },
      },
    },
  ]);

  let caseSizeStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    {
      $group: {
        _id: { productId: '$_id', caseSize: '$variants.caseSize' },
      },
    },
    {
      $group: {
        _id: '$_id.caseSize',
        count: { $sum: 1 },
      },
    },
    {
      $bucketAuto: {
        groupBy: '$_id',
        buckets: 4,
        output: {
          count: { $sum: '$count' },
        },
      },
    },
  ]);

  let movementStats = await Products.aggregate([
    ...basePipeline,
    {
      $group: {
        _id: { productId: '$_id', movementType: '$variants.movementType' },
      },
    },
    {
      $group: {
        _id: '$_id.movementType',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        movement: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  ///////////////////SIDE BAR/////////////////////

  return {
    products,
    categoryStats,
    brandStats,
    strapColorStats,
    dialColorStats,
    priceStats,
    caseSizeStats,
    movementStats,
    total,
    page,
    limit,
  };
};

const getProductsWithUpdatedOffers = async () => {
  try {
    // Fetch all products
    const products = await Products.find();

    // Fetch all product-level offers
    const productOffers = await ProductOffer.find({ status: 'active' });

    // Fetch all category-level offers
    const categoryOffers = await CategoryOffer.find({ status: 'active' });

    const productOfferMap = new Map();
    productOffers.forEach((offer) => {
      productOfferMap.set(String(offer.productId), offer);
    });

    const categoryOfferMap = new Map();
    categoryOffers.forEach((offer) => {
      categoryOfferMap.set(String(offer.categoryId), offer);
    });

    const updatedProducts = [];

    for (let product of products) {
      let productOffer = productOfferMap.get(String(product._id));
      let categoryOffer = categoryOfferMap.get(String(product.category));

      for (let variant of product.variants) {
        let actualPrice = variant.actualPrice;
        let productDiscount = 0;
        let categoryDiscount = 0;

        // Calculate product-level discount
        if (productOffer) {
          if (productOffer.discountType === 'PERCENTAGE') {
            productDiscount = (actualPrice * productOffer.discountValue) / 100;
          } else if (productOffer.discountType === 'FIXED') {
            productDiscount = productOffer.discountValue;
          }
        }

        // Calculate category-level discount
        if (categoryOffer) {
          if (categoryOffer.discountType === 'PERCENTAGE') {
            categoryDiscount =
              (actualPrice * categoryOffer.discountValue) / 100;
          } else if (categoryOffer.discountType === 'FIXED') {
            categoryDiscount = categoryOffer.discountValue;
          }
        }

        // Take the higher discount
        let highestDiscount = Math.max(productDiscount, categoryDiscount);

        // Calculate final offer price
        let offerPrice = actualPrice - highestDiscount;

        // If no discount applied, use actual price
        if (highestDiscount === 0) offerPrice = actualPrice;

        // Ensure price doesn't go below 0
        if (offerPrice < 0) offerPrice = 0;

        // Update the variant's offerPrice
        variant.offerPrice = Math.round(offerPrice);
      }

      // Save the updated product with updated variants
      await product.save();
      updatedProducts.push(product);
    }

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product offers:', error);
    throw error;
  }
};

const getWishlist = async (userId) => {
  return await Wishlist.aggregate([
    { $match: { userId } },
    { $unwind: '$items' },
  ]);
};

export default {
  getCategoryId,
  productListing,
  getProductsWithUpdatedOffers,
  getWishlist,
};
