const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

let getCategoryId = async (category) => {
  return await Category.find({ category }, { _id: 1 });
};

let productListing = async (
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
      $in: category.map((id) => new mongoose.Types.ObjectId(id)),
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
      sortOption['createdAt'] = -1;
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
    { $group: { _id: '$_id' } }, // unique product IDs
    { $count: 'total' },
  ]);

  let total = totalProducts.length > 0 ? totalProducts[0].total : 0;

  ///////////////////SIDE BAR/////////////////////
  let categoryStats = await Products.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    { $match: { 'categoryDetails.isActive': true } }, // filter categories by active
    {
      $group: {
        _id: '$categoryDetails._id',
        category: { $first: '$categoryDetails.categoryName' },
        count: { $sum: 1 },
      },
    },
  ]);

  let brandStats = await Products.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $project: { brand: '$_id', count: 1, _id: 0 } },
  ]);

  let strapColorStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $group: { _id: '$variants.strapColor', count: { $sum: 1 } } },
    { $project: { strapColor: '$_id', count: 1, _id: 0 } },
  ]);

  let dialColorStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $group: { _id: '$variants.dialColor', count: { $sum: 1 } } },
    { $project: { dialColor: '$_id', count: 1, _id: 0 } },
  ]);

  let priceStats = await Products.aggregate([
    { $unwind: '$variants' },
    {
      $group: {
        _id: '$_id',
        minPrice: { $min: '$variants.offerPrice' },
      },
    },
    {
      $bucket: {
        groupBy: '$minPrice',
        boundaries: [1000, 10000, 25000, 40000, 55000, 70000, 85000, 100000],
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
              { case: { $eq: ['$_id', 1000] }, then: '1000-10000' },
              { case: { $eq: ['$_id', 10000] }, then: '10000-25000' },
              { case: { $eq: ['$_id', 25000] }, then: '25000-40000' },
              { case: { $eq: ['$_id', 40000] }, then: '40000-55000' },
              { case: { $eq: ['$_id', 55000] }, then: '55000-70000' },
              { case: { $eq: ['$_id', 70000] }, then: '70000-85000' },
              { case: { $eq: ['$_id', 85000] }, then: '85000-10000' },
            ],
            default: 'Other',
          },
        },
      },
    },
  ]);

  let caseSizeStats = await Products.aggregate([
    { $unwind: '$variants' },
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
    { $unwind: '$variants' },
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

module.exports = {
  getCategoryId,
  productListing,
};
