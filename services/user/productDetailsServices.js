let productListing = async (
  search,
  page = 1,
  category,
  brand,
  strapColor,
  dialColor,
  caseSize,
  movement,
  sortOption = 'manual',
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  // Build match stage
  let matchStage = { isListed: true, 'variants.isListed': true };

  if (brand) matchStage.brand = { $in: Array.isArray(brand) ? brand : [brand] };
  if (strapColor)
    matchStage['variants.strapColor'] = {
      $in: Array.isArray(strapColor) ? strapColor : [strapColor],
    };
  if (dialColor)
    matchStage['variants.dialColor'] = {
      $in: Array.isArray(dialColor) ? dialColor : [dialColor],
    };
  if (caseSize)
    matchStage['variants.caseSize'] = {
      $in: Array.isArray(caseSize) ? caseSize : [caseSize],
    };
  if (movement)
    matchStage['variants.movementType'] = {
      $in: Array.isArray(movement) ? movement : [movement],
    };

  // Sorting logic
  let sort = {};
  switch (sortOption) {
    case 'priceHighToLow':
      sort['variants.offerPrice'] = -1;
      break;
    case 'priceLowToHigh':
      sort['variants.offerPrice'] = 1;
      break;
    case 'aToZ':
      sort['productName'] = 1;
      break;
    case 'zToA':
      sort['productName'] = -1;
      break;
    default:
      sort['createdAt'] = -1;
  }

  let pipeline = [
    { $match: matchStage },

    // Join with categories collection
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },

    // Apply search if provided
    ...(search
      ? [
          {
            $match: {
              $or: [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { 'variants.strapColor': { $regex: search, $options: 'i' } },
                { 'variants.dialColor': { $regex: search, $options: 'i' } },
                { 'variants.movementType': { $regex: search, $options: 'i' } },
                {
                  'categoryDetails.categoryName': {
                    $regex: search,
                    $options: 'i',
                  },
                },
              ],
            },
          },
        ]
      : []),

    // Sorting + pagination
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ];

  // Run aggregation
  let products = await Products.aggregate(pipeline);

  // Count total results (without pagination)
  let countPipeline = pipeline.filter(
    (stage) => !('$skip' in stage || '$limit' in stage || '$sort' in stage),
  );
  countPipeline.push({ $count: 'totalProducts' });
  let countResult = await Products.aggregate(countPipeline);
  let totalProducts = countResult[0]?.totalProducts || 0;
  let totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    pagination: {
      totalProducts,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
