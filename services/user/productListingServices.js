const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
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
    filter.category = { $in: category };
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
    filter['variants.movement'] = { $in: movement };
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

  if (search) {
    let searchConditions = [
      { productName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { 'variants.strapColor': { $regex: search, $options: 'i' } },
      { 'variants.dialColor': { $regex: search, $options: 'i' } },
      { 'variants.movementType': { $regex: search, $options: 'i' } },
    ];
    matchStage.$and.push({ $or: searchConditions });
  }

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
    case 'manual':
      sortOption['createdAt'] = -1;
      break;
    default:
      sortOption['createdAt'] = -1;
  }

  //PRODUCT LIST
  let products = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
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
  ]);

  //TOTAL PRODUCTS
  let totalProducts = await Products.aggregate([
    { $unwind: '$variants' },
    { $match: matchStage },
    { $count: 'total' },
  ]);
  let total = totalProducts.length > 0 ? totalProducts[0].total : 0;

  ///////////////////SIDE BAR/////////////////////
  let categoryStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: { category: '$categoryDetails.categoryName', count: 1 },
    },
  ]);

  let brandStats = await Products.aggregate([
    { $unwind: '$variants' },
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
      $bucket: {
        groupBy: '$variants.offerPrice',
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
              { case: { $eq: ['$_id', 1000] }, then: '1000-9999' },
              { case: { $eq: ['$_id', 10000] }, then: '10000-24999' },
              { case: { $eq: ['$_id', 25000] }, then: '25000-39999' },
              { case: { $eq: ['$_id', 40000] }, then: '40000-54999' },
              { case: { $eq: ['$_id', 55000] }, then: '55000-69999' },
              { case: { $eq: ['$_id', 70000] }, then: '70000-84999' },
              { case: { $eq: ['$_id', 85000] }, then: '85000-99999' },
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
      $bucketAuto: {
        groupBy: '$variants.caseSize',
        buckets: 4,
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);

  let movementStats = await Products.aggregate([
    { $unwind: '$variants' },
    { $group: { _id: '$variants.movementType', count: { $sum: 1 } } },
    { $project: { movement: '$_id', count: 1, _id: 0 } },
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
