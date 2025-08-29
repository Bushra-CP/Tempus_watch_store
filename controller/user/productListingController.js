const logger = require('../../utils/logger');
const env = require('dotenv').config();
const productListingServices = require('../../services/user/productListingServices');

const productListing = async (req, res) => {
  try {
    console.log(req.query);
    let search = req.query.search || '';
    let page = parseInt(req.query.page) || 1;
    let limit = 9;

    let {
      category,
      brand,
      price,
      strapColor,
      dialColor,
      caseSize,
      movement,
      sort,
    } = req.query;

    // Ensure arrays
    if (category && !Array.isArray(category)) category = [category];
    if (brand && !Array.isArray(brand)) brand = [brand];
    if (price && !Array.isArray(price)) price = [price];
    if (strapColor && !Array.isArray(strapColor)) strapColor = [strapColor];
    if (dialColor && !Array.isArray(dialColor)) dialColor = [dialColor];
    if (caseSize && !Array.isArray(caseSize)) caseSize = [caseSize];
    if (movement && !Array.isArray(movement)) movement = [movement];

    // Call service
    let {
      products,
      categoryStats,
      brandStats,
      strapColorStats,
      dialColorStats,
      priceStats,
      caseSizeStats,
      movementStats,
      total,
    } = await productListingServices.productListing(
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
    );

    // Calculate total pages
    let totalPages = Math.ceil(total / limit);

    // Pass all data to EJS
    res.render('productListingPage', {
      products, // ✅ important!
      categoryStats,
      brandStats,
      strapColorStats,
      dialColorStats,
      priceStats,
      caseSizeStats,
      movementStats,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    logger.error('Error rendering product listing page: ', error);
    res.status(500).send('Error loading product listing page');
  }
};

module.exports = {
  productListing,
};
