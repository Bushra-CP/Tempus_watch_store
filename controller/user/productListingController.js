import logger from '../../utils/logger.js';
import dotenv from 'dotenv';
import productListingServices from '../../services/user/productListingServices.js';
import mongoose from 'mongoose';
import User from '../../models/userSchema.js';

dotenv.config(); // load environment variables

const productListing = async (req, res) => {
  try {
    await productListingServices.getProductsWithUpdatedOffers();
    //console.log(req.query);
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
    //console.log(category);
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

    let wishlist;
    let user = req.session.user;
    if (user) {
      let userId = user._id;
      userId = new mongoose.Types.ObjectId(userId);
      const userData = await User.findById(userId);
      wishlist = await productListingServices.getWishlist(userId);
    }

    //console.log(products);

    // 🔑 If request is AJAX → send JSON only
    if (req.xhr) {
      return res.json({
        products,
        currentPage: page,
        totalPages,
        total,
        wishlist: wishlist || [],
      });
    }

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
      total,
      search,
      page,
      wishlist,
    });
  } catch (error) {
    logger.error('Error rendering product listing page: ', error);
    res.status(500).send('Error loading product listing page');
  }
};

export default {
  productListing,
};
